import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

// Never cache private profile responses.
export const dynamic = "force-dynamic";

const PROFILE_FIELDS =
  "id, display_name, avatar_url, created_at, updated_at";

function errorResponse(
  status: number,
  code: string,
  message: string
) {
  return NextResponse.json(
    { error: { code, message } },
    {
      status,
      headers: { "Cache-Control": "private, no-store" },
    }
  );
}

function successResponse(data: unknown) {
  return NextResponse.json(
    { data },
    {
      headers: { "Cache-Control": "private, no-store" },
    }
  );
}

// GET /api/profile
// Returns only the currently signed-in user's profile.
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse(
        401,
        "UNAUTHORIZED",
        "Please log in to view your profile."
      );
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return errorResponse(
        500,
        "DATABASE_ERROR",
        "Unable to load your profile."
      );
    }

    if (!profile) {
      return errorResponse(
        404,
        "PROFILE_NOT_FOUND",
        "Your profile could not be found."
      );
    }

    return successResponse(profile);
  } catch {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred."
    );
  }
}

// PATCH /api/profile
// Accepts only { "display_name": "New name" }.
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse(
        401,
        "UNAUTHORIZED",
        "Please log in to update your profile."
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        400,
        "INVALID_JSON",
        "Send a valid JSON request body."
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return errorResponse(
        400,
        "INVALID_INPUT",
        "Send an object containing display_name."
      );
    }

    const input = body as Record<string, unknown>;

    // Reject user IDs and other unexpected fields.
    if (
      Object.keys(input).length !== 1 ||
      !Object.prototype.hasOwnProperty.call(input, "display_name") ||
      typeof input.display_name !== "string"
    ) {
      return errorResponse(
        400,
        "INVALID_INPUT",
        "Only a display_name string is accepted."
      );
    }

    const displayName = input.display_name.trim();

    if (displayName.length < 1 || displayName.length > 100) {
      return errorResponse(
        400,
        "INVALID_NAME",
        "Name must contain between 1 and 100 characters."
      );
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select(PROFILE_FIELDS)
      .maybeSingle();

    if (error) {
      return errorResponse(
        500,
        "DATABASE_ERROR",
        "Unable to update your profile."
      );
    }

    if (!profile) {
      return errorResponse(
        404,
        "PROFILE_NOT_FOUND",
        "Your profile could not be found."
      );
    }

    return successResponse(profile);
  } catch {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred."
    );
  }
}