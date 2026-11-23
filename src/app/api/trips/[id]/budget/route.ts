import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type BudgetRouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function GET(
  _request: Request,
  context: BudgetRouteContext,
) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return errorResponse("INVALID_ID", "Invalid trip ID.", 400);
  }

  const supabase = createClient(await cookies());

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorResponse(
      "UNAUTHENTICATED",
      "You must be logged in.",
      401,
    );
  }

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, estimated_budget, currency")
    .eq("id", id)
    .maybeSingle();

  if (tripError) {
    return errorResponse(
      "DATABASE_ERROR",
      "Unable to load the trip.",
      500,
    );
  }

  if (!trip) {
    return errorResponse(
      "NOT_FOUND",
      "Trip not found or you do not have access.",
      404,
    );
  }

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("category, estimated_cost")
    .eq("trip_id", id);

  if (activitiesError) {
    return errorResponse(
      "DATABASE_ERROR",
      "Unable to load activity costs.",
      500,
    );
  }

  const categoryTotals: Record<string, number> = {};
  let activityTotal = 0;

  for (const activity of activities ?? []) {
    const cost = Number(activity.estimated_cost ?? 0);
    const category = activity.category ?? "other";

    activityTotal += cost;
    categoryTotals[category] = (categoryTotals[category] ?? 0) + cost;
  }

  const estimatedBudget =
    trip.estimated_budget === null
      ? null
      : Number(trip.estimated_budget);

  const remainingBudget =
    estimatedBudget === null
      ? null
      : estimatedBudget - activityTotal;

  return NextResponse.json(
    {
      data: {
        trip_id: trip.id,
        currency: trip.currency,
        estimated_budget: estimatedBudget,
        activity_total: activityTotal,
        remaining_budget: remainingBudget,
        category_totals: categoryTotals,
        activity_count: activities?.length ?? 0,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}