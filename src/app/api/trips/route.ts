import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const TRIP_FIELDS = [
  "id",
  "user_id",
  "title",
  "destination",
  "start_date",
  "end_date",
  "description",
  "time_zone",
  "accommodation",
  "hero_image_url",
  "estimated_budget",
  "currency",
  "created_at",
  "updated_at",
].join(", ");

// Validate real calendar dates, not just their format.
const dateSchema = z.iso.date().refine(
  (value) => value >= "0001-01-01",
  "Date must be in year 0001 or later."
);

const createTripSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    destination: z.string().trim().min(1).max(200),

    start_date: dateSchema,
    end_date: dateSchema,

    description: z.string().trim().max(5000).nullable().optional(),

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
      .default("UTC"),

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
      .regex(/^[A-Z]{3}$/, "Use a three-letter code, such as USD.")
      .default("USD"),
  })
  .strict()
  .refine((trip) => trip.end_date >= trip.start_date, {
    path: ["end_date"],
    message: "End date cannot be before start date.",
  });

const paginationSchema = z.object({
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

// GET /api/trips?limit=20&offset=0
// RLS returns owned trips plus trips explicitly shared with the user.
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return fail(401, "UNAUTHORIZED", "Please log in to view trips.");
    }

    const params = new URL(request.url).searchParams;

    const parsed = paginationSchema.safeParse({
      limit: params.get("limit") ?? undefined,
      offset: params.get("offset") ?? undefined,
    });

    if (!parsed.success) {
      return fail(
        400,
        "INVALID_QUERY",
        "Invalid pagination parameters.",
        parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
      );
    }

    const { limit, offset } = parsed.data;

    const { data, error } = await supabase
      .from("trips")
      .select(TRIP_FIELDS)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return fail(500, "DATABASE_ERROR", "Unable to load trips.");
    }

    return jsonResponse({
      data: data ?? [],
      meta: { limit, offset },
    });
  } catch {
    return fail(500, "INTERNAL_ERROR", "An unexpected error occurred.");
  }
}

// POST /api/trips
// The authenticated user is always the new trip's owner.
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return fail(401, "UNAUTHORIZED", "Please log in to create a trip.");
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

    const parsed = createTripSchema.safeParse(body);

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

    const { data, error } = await supabase
      .from("trips")
      .insert({
        ...parsed.data,
        user_id: user.id,
      })
      .select(TRIP_FIELDS)
      .single();

    if (error) {
      if (error.code === "23503") {
        return fail(
          409,
          "PROFILE_REQUIRED",
          "Your account needs a profile before creating a trip."
        );
      }

      if (error.code === "42501") {
        return fail(
          403,
          "FORBIDDEN",
          "You do not have permission to create this trip."
        );
      }

      return fail(500, "DATABASE_ERROR", "Unable to create the trip.");
    }

    return jsonResponse({ data }, 201);
  } catch {
    return fail(500, "INTERNAL_ERROR", "An unexpected error occurred.");
  }
}