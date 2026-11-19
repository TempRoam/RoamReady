import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type TripRouteContext = {
  params: Promise<{ id: string }>;
};

// Keep this as one literal string for Supabase's type inference.
const TRIP_FIELDS = "id, user_id, title, destination, start_date, end_date, description, time_zone, accommodation, hero_image_url, estimated_budget, currency, created_at, updated_at" as const;

const dateSchema = z.iso.date().refine(
  (value) => value >= "0001-01-01",
  "Date must be in year 0001 or later."
);

const updateTripSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),

    destination: z.string().trim().min(1).max(200).optional(),

    start_date: dateSchema.optional(),

    end_date: dateSchema.optional(),

    description: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),

    time_zone: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat("en-US", {
            timeZone: value,
          }).format();

          return true;
        } catch {
          return false;
        }
      }, "Enter a valid time zone, such as Asia/Tokyo.")
      .optional(),

    accommodation: z
      .string()
      .trim()
      .max(300)
      .nullable()
      .optional(),

    estimated_budget: z
      .number()
      .finite()
      .nonnegative()
      .max(9999999999.99)
      .multipleOf(0.01)
      .nullable()
      .optional(),

    currency: z
      .string()
      .trim()
      .regex(
        /^[A-Z]{3}$/,
        "Use a three-letter code, such as USD."
      )
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
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

// Authenticate and load a trip through the user's RLS policies.
async function loadTrip(context: TripRouteContext) {
  const supabase = createClient(await cookies());

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false as const,
      response: fail(
        401,
        "UNAUTHORIZED",
        "Please log in."
      ),
    };
  }

  const { id } = await context.params;
  const validId = z.uuid().safeParse(id);

  if (!validId.success) {
    return {
      ok: false as const,
      response: fail(
        400,
        "INVALID_ID",
        "Invalid trip ID."
      ),
    };
  }

  const { data: trip, error } = await supabase
    .from("trips")
    .select(TRIP_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return {
      ok: false as const,
      response: fail(
        500,
        "DATABASE_ERROR",
        "Unable to load trip."
      ),
    };
  }

  // Do not reveal whether an inaccessible trip exists.
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

// GET /api/trips/[id]
// Owners and invited viewers/editors can read the trip.
export async function GET(
  _request: Request,
  context: TripRouteContext
) {
  try {
    const result = await loadTrip(context);

    if (!result.ok) {
      return result.response;
    }

    return jsonResponse({
      data: result.trip,
    });
  } catch {
    return fail(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred."
    );
  }
}

// PATCH /api/trips/[id]
// Only the owner can update trip details.
export async function PATCH(
  request: Request,
  context: TripRouteContext
) {
  try {
    const result = await loadTrip(context);

    if (!result.ok) {
      return result.response;
    }

    const { supabase, user, trip, id } = result;

    if (trip.user_id !== user.id) {
      return fail(
        403,
        "FORBIDDEN",
        "Only the owner can update trip details."
      );
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
      return fail(
        400,
        "INVALID_JSON",
        "Send a valid JSON body."
      );
    }

    const parsed = updateTripSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        400,
        "VALIDATION_ERROR",
        "Check the trip details.",
        parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
      );
    }

    // Validate supplied dates alongside unchanged existing dates.
    const startDate =
      parsed.data.start_date ?? trip.start_date;

    const endDate =
      parsed.data.end_date ?? trip.end_date;

    if (startDate && endDate && endDate < startDate) {
      return fail(
        400,
        "INVALID_DATE_RANGE",
        "End date cannot be before start date."
      );
    }

    const { data, error } = await supabase
      .from("trips")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select(TRIP_FIELDS)
      .maybeSingle();

    if (error) {
      if (error.code === "23514") {
        return fail(
          400,
          "CONSTRAINT_VIOLATION",
          "The trip details violate a database constraint."
        );
      }

      if (error.code === "42501") {
        return fail(
          403,
          "FORBIDDEN",
          "You do not have permission to update this trip."
        );
      }

      return fail(
        500,
        "DATABASE_ERROR",
        "Unable to update trip."
      );
    }

    if (!data) {
      return fail(
        404,
        "TRIP_NOT_FOUND",
        "Trip is no longer available."
      );
    }

    return jsonResponse({ data });
  } catch {
    return fail(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred."
    );
  }
}

// DELETE /api/trips/[id]
// Deletes the trip and its linked activities/memberships.
export async function DELETE(
  _request: Request,
  context: TripRouteContext
) {
  try {
    const result = await loadTrip(context);

    if (!result.ok) {
      return result.response;
    }

    const { supabase, user, trip, id } = result;

    if (trip.user_id !== user.id) {
      return fail(
        403,
        "FORBIDDEN",
        "Only the owner can delete the trip."
      );
    }

    const { data, error } = await supabase
      .from("trips")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return fail(
        500,
        "DATABASE_ERROR",
        "Unable to delete trip."
      );
    }

    if (!data) {
      return fail(
        404,
        "TRIP_NOT_FOUND",
        "Trip is no longer available."
      );
    }

    return jsonResponse({ data });
  } catch {
    return fail(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred."
    );
  }
}
