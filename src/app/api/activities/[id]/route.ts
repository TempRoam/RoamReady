import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const ACTIVITY_FIELDS =
  "id, trip_id, title, activity_date, start_time, location, description, category, image_url, sort_order, estimated_cost, created_at" as const;

const activityIdSchema = z.uuid();

const updateActivitySchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    activity_date: z.iso.date().optional(),
    start_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
      .nullable()
      .optional(),
    location: z.string().trim().max(500).nullable().optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    category: z
      .enum([
        "culture",
        "food",
        "sightseeing",
        "transportation",
        "accommodation",
        "other",
      ])
      .optional(),
    sort_order: z.number().int().min(0).max(2147483647).optional(),
    estimated_cost: z
      .number()
      .finite()
      .min(0)
      .max(9999999999.99)
      .multipleOf(0.01)
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}

function successResponse(data: unknown, status = 200) {
  return NextResponse.json(
    { data },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}

async function getActivityContext(id: string) {
  const supabase = createClient(await cookies());

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: errorResponse(
        "UNAUTHENTICATED",
        "You must be logged in.",
        401,
      ),
    };
  }

  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .select("id, trip_id, activity_date")
    .eq("id", id)
    .maybeSingle();

  if (activityError) {
    return {
      error: errorResponse(
        "DATABASE_ERROR",
        "Unable to load the activity.",
        500,
      ),
    };
  }

  if (!activity) {
    return {
      error: errorResponse("NOT_FOUND", "Activity not found.", 404),
    };
  }

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, user_id, start_date, end_date")
    .eq("id", activity.trip_id)
    .maybeSingle();

  if (tripError) {
    return {
      error: errorResponse("DATABASE_ERROR", "Unable to load the trip.", 500),
    };
  }

  if (!trip) {
    return {
      error: errorResponse("NOT_FOUND", "Trip not found.", 404),
    };
  }

  let role: "owner" | "editor" | "viewer" | null = null;

  if (trip.user_id === user.id) {
    role = "owner";
  } else {
    const { data: member, error: memberError } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", trip.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberError) {
      return {
        error: errorResponse(
          "DATABASE_ERROR",
          "Unable to check trip permissions.",
          500,
        ),
      };
    }

    role = member?.role ?? null;
  }

  if (!role) {
    return {
      error: errorResponse(
        "FORBIDDEN",
        "You do not have access to this activity.",
        403,
      ),
    };
  }

  return {
    supabase,
    user,
    activity,
    trip,
    role,
  };
}

type ActivityRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: ActivityRouteContext,
) {
  const { id } = await context.params;

  const parsedId = activityIdSchema.safeParse(id);

  if (!parsedId.success) {
    return errorResponse("INVALID_ID", "Invalid activity ID.", 400);
  }

  const activityContext = await getActivityContext(id);

  if ("error" in activityContext) {
    return activityContext.error;
  }

  const { supabase, trip, role } = activityContext;

  if (role !== "owner" && role !== "editor") {
    return errorResponse(
      "FORBIDDEN",
      "Only trip owners and editors can update activities.",
      403,
    );
  }

  if (request.headers.get("content-type")?.includes("application/json") !== true) {
    return errorResponse(
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type must be application/json.",
      415,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const parsedBody = updateActivitySchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Invalid activity data.",
      400,
      parsedBody.error.flatten(),
    );
  }

  const updates = parsedBody.data;

  if (
    updates.activity_date &&
    trip.start_date &&
    updates.activity_date < trip.start_date
  ) {
    return errorResponse(
      "ACTIVITY_OUTSIDE_TRIP",
      "Activity date must be within the trip dates.",
      400,
    );
  }

  if (
    updates.activity_date &&
    trip.end_date &&
    updates.activity_date > trip.end_date
  ) {
    return errorResponse(
      "ACTIVITY_OUTSIDE_TRIP",
      "Activity date must be within the trip dates.",
      400,
    );
  }

  const { data, error } = await supabase
    .from("activities")
    .update(updates)
    .eq("id", id)
    .select(ACTIVITY_FIELDS)
    .maybeSingle();

  if (error) {
    if (error.code === "42501") {
      return errorResponse("FORBIDDEN", "Activity update was not allowed.", 403);
    }

    if (error.code === "23514") {
      return errorResponse("CONSTRAINT_ERROR", "Activity data is invalid.", 400);
    }

    return errorResponse("DATABASE_ERROR", "Unable to update activity.", 500);
  }

  if (!data) {
    return errorResponse("NOT_FOUND", "Activity not found.", 404);
  }

  return successResponse(data);
}

export async function DELETE(
  _request: Request,
  context: ActivityRouteContext,
) {
  const { id } = await context.params;

  const parsedId = activityIdSchema.safeParse(id);

  if (!parsedId.success) {
    return errorResponse("INVALID_ID", "Invalid activity ID.", 400);
  }

  const activityContext = await getActivityContext(id);

  if ("error" in activityContext) {
    return activityContext.error;
  }

  const { supabase, role } = activityContext;

  if (role !== "owner" && role !== "editor") {
    return errorResponse(
      "FORBIDDEN",
      "Only trip owners and editors can delete activities.",
      403,
    );
  }

  const { data, error } = await supabase
    .from("activities")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "42501") {
      return errorResponse("FORBIDDEN", "Activity deletion was not allowed.", 403);
    }

    return errorResponse("DATABASE_ERROR", "Unable to delete activity.", 500);
  }

  if (!data) {
    return errorResponse("NOT_FOUND", "Activity not found.", 404);
  }

  return successResponse({ id: data.id });
}