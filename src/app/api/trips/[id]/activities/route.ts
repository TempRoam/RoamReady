import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type TripRouteContext = {
  params: Promise<{ id: string }>;
};

const ACTIVITY_FIELDS = "id, trip_id, title, activity_date, start_time, location, description, category, image_url, sort_order, estimated_cost, created_at" as const;

const dateSchema = z.iso.date().refine(
  (value) => value >= "0001-01-01",
  "Date must be in year 0001 or later."
);

const createActivitySchema = z
  .object({
    title: z.string().trim().min(1).max(200),

    activity_date: dateSchema,

    // Local time in the parent trip's time zone.
    start_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
        "Use a 24-hour time, such as 09:00 or 15:30."
      )
      .nullable()
      .optional(),

    location: z.string().trim().max(500).nullable().optional(),

    description: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),

    category: z
      .enum([
        "culture",
        "food",
        "sightseeing",
        "transportation",
        "accommodation",
        "other",
      ])
      .default("other"),

    sort_order: z
      .number()
      .int()
      .min(0)
      .max(2147483647)
      .default(0),

    // Amount in the parent trip's currency.
    estimated_cost: z
      .number()
      .finite()
      .nonnegative()
      .max(9999999999.99)
      .multipleOf(0.01)
      .default(0),
  })
  .strict();

const listQuerySchema = z.object({
  date: dateSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(100000).default(0),
});

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

function fail(
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  return jsonResponse(
    {
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details }),
      },
    },
    status
  );
}

// Verify authentication and check access to the parent trip.
async function loadTrip(context: TripRouteContext) {
  const supabase = createClient(await cookies());

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false as const,
      response: fail(401, "UNAUTHORIZED", "Please log in."),
    };
  }

  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return {
      ok: false as const,
      response: fail(400, "INVALID_ID", "Invalid trip ID."),
    };
  }

  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, user_id, start_date, end_date")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return {
      ok: false as const,
      response: fail(500, "DATABASE_ERROR", "Unable to load trip."),
    };
  }

  if (!trip) {
    return {
      ok: false as const,
      response: fail(
        404,
        "TRIP_NOT_FOUND",
        "Trip not found or unavailable."
      ),
    };
  }

  return {
    ok: true as const,
    supabase,
    user,
    trip,
    id,
  };
}

// GET /api/trips/[id]/activities
// Optional query: ?date=2027-05-12&limit=20&offset=0
export async function GET(
  request: Request,
  context: TripRouteContext
) {
  try {
    const result = await loadTrip(context);

    if (!result.ok) {
      return result.response;
    }

    const params = new URL(request.url).searchParams;

    const parsed = listQuerySchema.safeParse({
      date: params.get("date") ?? undefined,
      limit: params.get("limit") ?? undefined,
      offset: params.get("offset") ?? undefined,
    });

    if (!parsed.success) {
      return fail(
        400,
        "INVALID_QUERY",
        "Check the date and pagination parameters.",
        parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
      );
    }

    const { date, limit, offset } = parsed.data;
    const { supabase, id } = result;

    let query = supabase
      .from("activities")
      .select(ACTIVITY_FIELDS)
      .eq("trip_id", id);

    if (date) {
      query = query.eq("activity_date", date);
    }

    const { data, error } = await query
      .order("activity_date", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("start_time", {
        ascending: true,
        nullsFirst: false,
      })
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return fail(
        500,
        "DATABASE_ERROR",
        "Unable to load activities."
      );
    }

    return jsonResponse({
      data: data ?? [],
      meta: {
        limit,
        offset,
        date: date ?? null,
      },
    });
  } catch {
    return fail(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred."
    );
  }
}

// POST /api/trips/[id]/activities
// Only owners and editors can add activities.
export async function POST(
  request: Request,
  context: TripRouteContext
) {
  try {
    const result = await loadTrip(context);

    if (!result.ok) {
      return result.response;
    }

    const { supabase, user, trip, id } = result;

    // Owners may create activities directly.
    // Other users must have an editor membership.
    if (trip.user_id !== user.id) {
      const { data: membership, error } = await supabase
        .from("trip_members")
        .select("role")
        .eq("trip_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        return fail(
          500,
          "DATABASE_ERROR",
          "Unable to verify trip permissions."
        );
      }

      if (membership?.role !== "editor") {
        return fail(
          403,
          "FORBIDDEN",
          "Only the owner and editors can add activities."
        );
      }
    }

    const contentType = request.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();

    if (contentType !== "application/json") {
      return fail(
        415,
        "UNSUPPORTED_MEDIA_TYPE",
        "Send the request as application/json."
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return fail(400, "INVALID_JSON", "Send a valid JSON body.");
    }

    const parsed = createActivitySchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        400,
        "VALIDATION_ERROR",
        "Check the activity details.",
        parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
      );
    }

    const activityDate = parsed.data.activity_date;

    if (
      (trip.start_date && activityDate < trip.start_date) ||
      (trip.end_date && activityDate > trip.end_date)
    ) {
      return fail(
        400,
        "ACTIVITY_OUTSIDE_TRIP",
        "Activity date must fall within the trip dates."
      );
    }

    // RLS checks permissions again when the row is inserted.
    const { data, error } = await supabase
      .from("activities")
      .insert({
        ...parsed.data,
        trip_id: id,
      })
      .select(ACTIVITY_FIELDS)
      .single();

    if (error) {
      if (error.code === "42501") {
        return fail(
          403,
          "FORBIDDEN",
          "You do not have permission to add this activity."
        );
      }

      if (error.code === "23503") {
        return fail(
          409,
          "TRIP_UNAVAILABLE",
          "The parent trip is no longer available."
        );
      }

      if (error.code === "23514") {
        return fail(
          400,
          "CONSTRAINT_VIOLATION",
          "The activity violates a database constraint."
        );
      }

      return fail(
        500,
        "DATABASE_ERROR",
        "Unable to create activity."
      );
    }

    return jsonResponse({ data }, 201);
  } catch {
    return fail(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred."
    );
  }
}