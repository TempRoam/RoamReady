import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type MembersRouteContext = {
  params: Promise<{ id: string }>;
};

const memberSchema = z
  .object({
    user_id: z.uuid(),
    role: z.enum(["viewer", "editor"]).default("viewer"),
  })
  .strict();

const removeMemberSchema = z
  .object({
    user_id: z.uuid(),
  })
  .strict();

 const updateMemberSchema = z
  .object({
    user_id: z.uuid(),
    role: z.enum(["viewer", "editor"]),
  })
  .strict(); 

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
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

async function getOwnerContext(tripId: string) {
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

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, user_id")
    .eq("id", tripId)
    .maybeSingle();

  if (tripError) {
    return {
      error: errorResponse(
        "DATABASE_ERROR",
        "Unable to load the trip.",
        500,
      ),
    };
  }

  if (!trip) {
    return {
      error: errorResponse("NOT_FOUND", "Trip not found.", 404),
    };
  }

  if (trip.user_id !== user.id) {
    return {
      error: errorResponse(
        "FORBIDDEN",
        "Only the trip owner can manage members.",
        403,
      ),
    };
  }

  return {
    supabase,
    user,
    trip,
  };
}

export async function GET(
  _request: Request,
  context: MembersRouteContext,
) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return errorResponse("INVALID_ID", "Invalid trip ID.", 400);
  }

  const ownerContext = await getOwnerContext(id);

  if ("error" in ownerContext) {
    return ownerContext.error;
  }

  const { supabase } = ownerContext;

  const { data, error } = await supabase
    .from("trip_members")
    .select("id, trip_id, user_id, role, created_at")
    .eq("trip_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return errorResponse(
      "DATABASE_ERROR",
      "Unable to load trip members.",
      500,
    );
  }

  return successResponse(data ?? []);
}

export async function POST(
  request: Request,
  context: MembersRouteContext,
) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return errorResponse("INVALID_ID", "Invalid trip ID.", 400);
  }

  const ownerContext = await getOwnerContext(id);

  if ("error" in ownerContext) {
    return ownerContext.error;
  }

  const { supabase, user } = ownerContext;

  if (!request.headers.get("content-type")?.includes("application/json")) {
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

  const parsedBody = memberSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Provide a valid user_id and role.",
      400,
    );
  }

  const { user_id, role } = parsedBody.data;

  if (user_id === user.id) {
    return errorResponse(
      "INVALID_MEMBER",
      "The trip owner cannot be added as a member.",
      400,
    );
  }

  const { data, error } = await supabase
    .from("trip_members")
    .insert({
      trip_id: id,
      user_id,
      role,
    })
    .select("id, trip_id, user_id, role, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return errorResponse(
        "ALREADY_MEMBER",
        "This user is already a member of the trip.",
        409,
      );
    }

    if (error.code === "23503") {
      return errorResponse(
        "USER_NOT_FOUND",
        "The selected user does not exist.",
        404,
      );
    }

    if (error.code === "42501") {
      return errorResponse(
        "FORBIDDEN",
        "You are not allowed to add members.",
        403,
      );
    }

    return errorResponse(
      "DATABASE_ERROR",
      "Unable to add trip member.",
      500,
    );
  }

  return successResponse(data, 201);
}

export async function PATCH(
  request: Request,
  context: MembersRouteContext,
) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return errorResponse("INVALID_ID", "Invalid trip ID.", 400);
  }

  const ownerContext = await getOwnerContext(id);

  if ("error" in ownerContext) {
    return ownerContext.error;
  }

  const { supabase } = ownerContext;

  if (!request.headers.get("content-type")?.includes("application/json")) {
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

  const parsedBody = updateMemberSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Provide a valid user_id and role.",
      400,
    );
  }

  const { user_id, role } = parsedBody.data;

  const { data, error } = await supabase
    .from("trip_members")
    .update({ role })
    .eq("trip_id", id)
    .eq("user_id", user_id)
    .select("id, trip_id, user_id, role, created_at")
    .maybeSingle();

  if (error) {
    if (error.code === "42501") {
      return errorResponse(
        "FORBIDDEN",
        "You are not allowed to update members.",
        403,
      );
    }

    return errorResponse(
      "DATABASE_ERROR",
      "Unable to update trip member.",
      500,
    );
  }

  if (!data) {
    return errorResponse("NOT_FOUND", "Trip member not found.", 404);
  }

  return successResponse(data);
}

export async function DELETE(
  request: Request,
  context: MembersRouteContext,
) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return errorResponse("INVALID_ID", "Invalid trip ID.", 400);
  }

  const ownerContext = await getOwnerContext(id);

  if ("error" in ownerContext) {
    return ownerContext.error;
  }

  const { supabase } = ownerContext;

  if (!request.headers.get("content-type")?.includes("application/json")) {
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

  const parsedBody = removeMemberSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Provide a valid user_id.",
      400,
    );
  }

  const { user_id } = parsedBody.data;

  const { data, error } = await supabase
    .from("trip_members")
    .delete()
    .eq("trip_id", id)
    .eq("user_id", user_id)
    .select("id, user_id")
    .maybeSingle();

  if (error) {
    if (error.code === "42501") {
      return errorResponse(
        "FORBIDDEN",
        "You are not allowed to remove members.",
        403,
      );
    }

    return errorResponse(
      "DATABASE_ERROR",
      "Unable to remove trip member.",
      500,
    );
  }

  if (!data) {
    return errorResponse("NOT_FOUND", "Trip member not found.", 404);
  }

  return successResponse(data);
}