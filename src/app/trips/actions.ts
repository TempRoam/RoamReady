/**
 * a) Module Name: Trip CRUD Server Actions
 * b) Date of Code: November 18, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Backend Next.js Server Actions providing authenticated Create, Read,
 *    Update, and Delete operations for user trips in Supabase PostgreSQL. Serves as the
 *    backend data layer for the Trip Overview dashboard and trip detail views.
 * e) Important Functions:
 *    - getUserTrips(): Lists all trips belonging to the currently authenticated user.
 *    - getTripById(tripId): Fetches a single owned trip along with its itinerary, checklist, and budget entries.
 *    - createTrip(input): Validates input and inserts a new trip owned by the authenticated user.
 *    - updateTrip(tripId, input): Validates partial updates and date order before updating an owned trip.
 *    - deleteTrip(tripId): Deletes an owned trip (cascading to child itinerary, checklist, and budget rows).
 * f) Important Data Structures:
 *    - ActionResult<T>: Standardized { data, error } return envelope for predictable client handling.
 *    - Trip & TripWithDetails: Strictly typed domain models defined in src/types/trips.ts.
 * g) Algorithm & Justification:
 *    - Two-Layer Authorization (Application + Database RLS): Every action independently authenticates
 *      via supabase.auth.getUser() and scopes queries by user_id, reinforcing PostgreSQL Row-Level
 *      Security policies and ensuring zero cross-account data leakage.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import {
  isValidUuid,
  validateCreateTripInput,
  validateUpdateTripInput,
} from '@/lib/trips/validation';
import type {
  ActionResult,
  BudgetEntry,
  ChecklistItem,
  CreateTripInput,
  ItineraryItem,
  Trip,
  TripWithDetails,
  UpdateTripInput,
} from '@/types/trips';

const TRIP_COLUMNS =
  'id, user_id, title, destination, start_date, end_date, description, created_at, updated_at';

const ITINERARY_COLUMNS =
  'id, trip_id, user_id, title, location, category, start_time, end_time, notes, sort_order, created_at, updated_at';

const CHECKLIST_COLUMNS =
  'id, trip_id, user_id, label, category, is_completed, sort_order, created_at, updated_at';

const BUDGET_COLUMNS =
  'id, trip_id, user_id, category, amount, currency, note, entry_date, created_at, updated_at';

async function getAuthenticatedContext() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, error: 'Authentication required. Please log in.' };
  }

  return { supabase, user, error: null };
}

/**
 * Fetches all trips owned by the currently authenticated user, sorted by start date descending.
 */
export async function getUserTrips(): Promise<ActionResult<Trip[]>> {
  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const { data, error } = await supabase
    .from('trips')
    .select(TRIP_COLUMNS)
    .eq('user_id', user.id)
    .order('start_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: 'Failed to load trips. Please try again.' };
  }

  return { data: (data ?? []) as Trip[], error: null };
}

/**
 * Fetches a single trip owned by the authenticated user along with its child
 * itinerary items, checklist items, and budget entries.
 */
export async function getTripById(
  tripId: string
): Promise<ActionResult<TripWithDetails>> {
  if (!isValidUuid(tripId)) {
    return { data: null, error: 'Invalid trip identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select(TRIP_COLUMNS)
    .eq('id', tripId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (tripError) {
    return { data: null, error: 'Failed to load trip details.' };
  }

  if (!trip) {
    return { data: null, error: 'Trip not found or access denied.' };
  }

  const [itineraryRes, checklistRes, budgetRes] = await Promise.all([
    supabase
      .from('itinerary_items')
      .select(ITINERARY_COLUMNS)
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .order('start_time', { ascending: true })
      .order('sort_order', { ascending: true }),
    supabase
      .from('checklist_items')
      .select(CHECKLIST_COLUMNS)
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('budget_entries')
      .select(BUDGET_COLUMNS)
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
  ]);

  if (itineraryRes.error || checklistRes.error || budgetRes.error) {
    return {
      data: null,
      error: 'Loaded trip, but failed to fetch one or more trip sections.',
    };
  }

  const tripWithDetails: TripWithDetails = {
    ...(trip as Trip),
    itinerary_items: (itineraryRes.data ?? []) as ItineraryItem[],
    checklist_items: (checklistRes.data ?? []) as ChecklistItem[],
    budget_entries: (budgetRes.data ?? []).map((entry) => ({
      ...entry,
      amount: Number(entry.amount),
    })) as BudgetEntry[],
  };

  return { data: tripWithDetails, error: null };
}

/**
 * Creates a new trip owned by the authenticated user.
 * Accepts either a typed CreateTripInput object or HTML FormData.
 */
export async function createTrip(
  input: CreateTripInput | FormData
): Promise<ActionResult<Trip>> {
  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const validated = validateCreateTripInput(input);
  if (validated.error || !validated.value) {
    return { data: null, error: validated.error ?? 'Invalid trip input.' };
  }

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      title: validated.value.title,
      destination: validated.value.destination,
      start_date: validated.value.start_date,
      end_date: validated.value.end_date,
      description: validated.value.description,
    })
    .select(TRIP_COLUMNS)
    .single();

  if (error) {
    if (error.code === '23514') {
      return { data: null, error: 'End date cannot be earlier than start date.' };
    }
    return { data: null, error: 'Failed to create trip. Please try again.' };
  }

  revalidatePath('/');
  revalidatePath('/trips');
  revalidatePath('/itinerary');

  return { data: data as Trip, error: null };
}

/**
 * Updates an existing trip owned by the authenticated user.
 * Validates partial fields and verifies chronological date ordering against existing dates.
 */
export async function updateTrip(
  tripId: string,
  input: UpdateTripInput | FormData
): Promise<ActionResult<Trip>> {
  if (!isValidUuid(tripId)) {
    return { data: null, error: 'Invalid trip identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const validated = validateUpdateTripInput(input);
  if (validated.error || !validated.value) {
    return { data: null, error: validated.error ?? 'Invalid trip update input.' };
  }

  // Fetch current trip dates to ensure ownership and validate partial date changes
  const { data: existing, error: fetchError } = await supabase
    .from('trips')
    .select('id, start_date, end_date')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) {
    return { data: null, error: 'Failed to verify trip ownership.' };
  }

  if (!existing) {
    return { data: null, error: 'Trip not found or access denied.' };
  }

  const effectiveStartDate =
    'start_date' in validated.value ? validated.value.start_date : existing.start_date;
  const effectiveEndDate =
    'end_date' in validated.value ? validated.value.end_date : existing.end_date;

  if (effectiveStartDate && effectiveEndDate && effectiveEndDate < effectiveStartDate) {
    return {
      data: null,
      error: 'End date cannot be earlier than start date.',
    };
  }

  const { data, error } = await supabase
    .from('trips')
    .update(validated.value)
    .eq('id', tripId)
    .eq('user_id', user.id)
    .select(TRIP_COLUMNS)
    .single();

  if (error) {
    if (error.code === '23514') {
      return { data: null, error: 'End date cannot be earlier than start date.' };
    }
    return { data: null, error: 'Failed to update trip. Please try again.' };
  }

  revalidatePath('/');
  revalidatePath('/trips');
  revalidatePath(`/trips/${tripId}`);
  revalidatePath('/itinerary');

  return { data: data as Trip, error: null };
}

/**
 * Deletes an owned trip and cascades deletion to all associated itinerary,
 * checklist, and budget records.
 */
export async function deleteTrip(
  tripId: string
): Promise<ActionResult<{ id: string; deleted: boolean }>> {
  if (!isValidUuid(tripId)) {
    return { data: null, error: 'Invalid trip identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const { data, error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle();

  if (error) {
    return { data: null, error: 'Failed to delete trip. Please try again.' };
  }

  if (!data) {
    return { data: null, error: 'Trip not found or access denied.' };
  }

  revalidatePath('/');
  revalidatePath('/trips');
  revalidatePath('/itinerary');

  return { data: { id: data.id, deleted: true }, error: null };
}

// Re-export child collection Server Actions for unified backend import
export {
  getTripItinerary,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,
  getTripChecklist,
  addChecklistItem,
  toggleChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getTripBudget,
  addBudgetEntry,
  updateBudgetEntry,
  deleteBudgetEntry,
} from './child-actions';
