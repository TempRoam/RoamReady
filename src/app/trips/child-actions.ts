/**
 * a) Module Name: Trip Child Items Server Actions (Itinerary, Checklist, Budget)
 * b) Date of Code: November 23, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Authenticated Next.js Server Actions providing Create, Read, Update,
 *    and Delete (CRUD) operations for trip child collections: itinerary activities, packing/prep
 *    checklist tasks, and itemized travel budget expenses in Supabase PostgreSQL.
 * e) Important Functions:
 *    - Itinerary: addItineraryItem, updateItineraryItem, deleteItineraryItem, reorderItineraryItems, getTripItinerary.
 *    - Checklist: addChecklistItem, toggleChecklistItem, updateChecklistItem, deleteChecklistItem, getTripChecklist.
 *    - Budget: addBudgetEntry, updateBudgetEntry, deleteBudgetEntry, getTripBudget.
 * f) Important Data Structures:
 *    - ActionResult<T>: Standardized { data, error } return envelope.
 *    - Domain models: ItineraryItem, ChecklistItem, BudgetEntry.
 * g) Algorithm & Justification:
 *    - Two-Layer Parent Ownership Enforcement: Every insertion or update independently validates
 *      parent trip ownership via (SELECT 1 FROM trips WHERE id = trip_id AND user_id = auth.uid())
 *      before mutating database state. This prevents authorization bypass and works in tandem with
 *      PostgreSQL Row-Level Security policies.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import {
  isValidUuid,
  validateCreateBudgetEntryInput,
  validateCreateChecklistItemInput,
  validateCreateItineraryItemInput,
  validateUpdateBudgetEntryInput,
  validateUpdateChecklistItemInput,
  validateUpdateItineraryItemInput,
} from '@/lib/trips/validation';
import type {
  ActionResult,
  BudgetEntry,
  ChecklistItem,
  CreateBudgetEntryInput,
  CreateChecklistItemInput,
  CreateItineraryItemInput,
  ItineraryItem,
  UpdateBudgetEntryInput,
  UpdateChecklistItemInput,
  UpdateItineraryItemInput,
} from '@/types/trips';

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

async function verifyTripOwnership(
  supabase: ReturnType<typeof createClient>,
  tripId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('trips')
    .select('id')
    .eq('id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  return !error && !!data;
}

function revalidateTripPaths(tripId?: string) {
  revalidatePath('/');
  revalidatePath('/trips');
  revalidatePath('/itinerary');
  if (tripId) {
    revalidatePath(`/trips/${tripId}`);
  }
}

// ============================================================================
// Itinerary Item Server Actions
// ============================================================================

/**
 * Fetches all itinerary items for a specific trip owned by the authenticated user.
 */
export async function getTripItinerary(
  tripId: string
): Promise<ActionResult<ItineraryItem[]>> {
  if (!isValidUuid(tripId)) {
    return { data: null, error: 'Invalid trip identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const isOwner = await verifyTripOwnership(supabase, tripId, user.id);
  if (!isOwner) {
    return { data: null, error: 'Trip not found or access denied.' };
  }

  const { data, error } = await supabase
    .from('itinerary_items')
    .select(ITINERARY_COLUMNS)
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .order('start_time', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    return { data: null, error: 'Failed to load itinerary items.' };
  }

  return { data: (data ?? []) as ItineraryItem[], error: null };
}

/**
 * Adds a new itinerary activity/event to a trip owned by the authenticated user.
 */
export async function addItineraryItem(
  input: CreateItineraryItemInput | FormData
): Promise<ActionResult<ItineraryItem>> {
  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const validated = validateCreateItineraryItemInput(input);
  if (validated.error || !validated.value) {
    return { data: null, error: validated.error ?? 'Invalid itinerary input.' };
  }

  const isOwner = await verifyTripOwnership(
    supabase,
    validated.value.trip_id,
    user.id
  );
  if (!isOwner) {
    return { data: null, error: 'Trip not found or access denied.' };
  }

  const { data, error } = await supabase
    .from('itinerary_items')
    .insert({
      trip_id: validated.value.trip_id,
      user_id: user.id,
      title: validated.value.title,
      location: validated.value.location,
      category: validated.value.category,
      start_time: validated.value.start_time,
      end_time: validated.value.end_time,
      notes: validated.value.notes,
      sort_order: validated.value.sort_order,
    })
    .select(ITINERARY_COLUMNS)
    .single();

  if (error) {
    if (error.code === '23514') {
      return { data: null, error: 'End time cannot be earlier than start time.' };
    }
    return { data: null, error: 'Failed to add itinerary item.' };
  }

  revalidateTripPaths(validated.value.trip_id);
  return { data: data as ItineraryItem, error: null };
}

/**
 * Updates an itinerary activity owned by the authenticated user.
 */
export async function updateItineraryItem(
  itemId: string,
  input: UpdateItineraryItemInput | FormData
): Promise<ActionResult<ItineraryItem>> {
  if (!isValidUuid(itemId)) {
    return { data: null, error: 'Invalid item identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const validated = validateUpdateItineraryItemInput(input);
  if (validated.error || !validated.value) {
    return { data: null, error: validated.error ?? 'Invalid update input.' };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('itinerary_items')
    .select('id, trip_id, start_time, end_time')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { data: null, error: 'Itinerary item not found or access denied.' };
  }

  const effectiveStart = validated.value.start_time ?? existing.start_time;
  const effectiveEnd =
    'end_time' in validated.value ? validated.value.end_time : existing.end_time;

  if (
    effectiveStart &&
    effectiveEnd &&
    new Date(effectiveEnd).getTime() < new Date(effectiveStart).getTime()
  ) {
    return { data: null, error: 'End time cannot be earlier than start time.' };
  }

  const { data, error } = await supabase
    .from('itinerary_items')
    .update(validated.value)
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select(ITINERARY_COLUMNS)
    .single();

  if (error) {
    if (error.code === '23514') {
      return { data: null, error: 'End time cannot be earlier than start time.' };
    }
    return { data: null, error: 'Failed to update itinerary item.' };
  }

  revalidateTripPaths(existing.trip_id);
  return { data: data as ItineraryItem, error: null };
}

/**
 * Deletes an itinerary item owned by the authenticated user.
 */
export async function deleteItineraryItem(
  itemId: string
): Promise<ActionResult<{ id: string; deleted: boolean }>> {
  if (!isValidUuid(itemId)) {
    return { data: null, error: 'Invalid item identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const { data, error } = await supabase
    .from('itinerary_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select('id, trip_id')
    .maybeSingle();

  if (error) {
    return { data: null, error: 'Failed to delete itinerary item.' };
  }

  if (!data) {
    return { data: null, error: 'Itinerary item not found or access denied.' };
  }

  revalidateTripPaths(data.trip_id);
  return { data: { id: data.id, deleted: true }, error: null };
}

/**
 * Reorders a list of itinerary items within a trip owned by the authenticated user.
 */
export async function reorderItineraryItems(
  tripId: string,
  itemIdsInOrder: string[]
): Promise<ActionResult<{ success: boolean }>> {
  if (!isValidUuid(tripId)) {
    return { data: null, error: 'Invalid trip identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const isOwner = await verifyTripOwnership(supabase, tripId, user.id);
  if (!isOwner) {
    return { data: null, error: 'Trip not found or access denied.' };
  }

  const updates = itemIdsInOrder.map((id, index) =>
    supabase
      .from('itinerary_items')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
  );

  const results = await Promise.all(updates);
  const hasError = results.some((r) => r.error);

  if (hasError) {
    return { data: null, error: 'Failed to update order for all items.' };
  }

  revalidateTripPaths(tripId);
  return { data: { success: true }, error: null };
}

// ============================================================================
// Checklist Item Server Actions
// ============================================================================

/**
 * Fetches all checklist items for a specific trip owned by the authenticated user.
 */
export async function getTripChecklist(
  tripId: string
): Promise<ActionResult<ChecklistItem[]>> {
  if (!isValidUuid(tripId)) {
    return { data: null, error: 'Invalid trip identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const isOwner = await verifyTripOwnership(supabase, tripId, user.id);
  if (!isOwner) {
    return { data: null, error: 'Trip not found or access denied.' };
  }

  const { data, error } = await supabase
    .from('checklist_items')
    .select(CHECKLIST_COLUMNS)
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return { data: null, error: 'Failed to load checklist items.' };
  }

  return { data: (data ?? []) as ChecklistItem[], error: null };
}

/**
 * Adds a new checklist/packing task to a trip owned by the authenticated user.
 */
export async function addChecklistItem(
  input: CreateChecklistItemInput | FormData
): Promise<ActionResult<ChecklistItem>> {
  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const validated = validateCreateChecklistItemInput(input);
  if (validated.error || !validated.value) {
    return { data: null, error: validated.error ?? 'Invalid checklist input.' };
  }

  const isOwner = await verifyTripOwnership(
    supabase,
    validated.value.trip_id,
    user.id
  );
  if (!isOwner) {
    return { data: null, error: 'Trip not found or access denied.' };
  }

  const { data, error } = await supabase
    .from('checklist_items')
    .insert({
      trip_id: validated.value.trip_id,
      user_id: user.id,
      label: validated.value.label,
      category: validated.value.category,
      is_completed: validated.value.is_completed,
      sort_order: validated.value.sort_order,
    })
    .select(CHECKLIST_COLUMNS)
    .single();

  if (error) {
    return { data: null, error: 'Failed to add checklist item.' };
  }

  revalidateTripPaths(validated.value.trip_id);
  return { data: data as ChecklistItem, error: null };
}

/**
 * Toggles or updates the completion status of a checklist item.
 */
export async function toggleChecklistItem(
  itemId: string,
  isCompleted?: boolean
): Promise<ActionResult<ChecklistItem>> {
  if (!isValidUuid(itemId)) {
    return { data: null, error: 'Invalid item identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  let nextCompleted = isCompleted;

  if (nextCompleted === undefined) {
    const { data: existing, error: fetchError } = await supabase
      .from('checklist_items')
      .select('is_completed')
      .eq('id', itemId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError || !existing) {
      return { data: null, error: 'Checklist item not found or access denied.' };
    }
    nextCompleted = !existing.is_completed;
  }

  const { data, error } = await supabase
    .from('checklist_items')
    .update({ is_completed: nextCompleted })
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select(CHECKLIST_COLUMNS)
    .single();

  if (error) {
    return { data: null, error: 'Failed to toggle checklist item.' };
  }

  revalidateTripPaths(data.trip_id);
  return { data: data as ChecklistItem, error: null };
}

/**
 * Updates a checklist item's label, category, or order.
 */
export async function updateChecklistItem(
  itemId: string,
  input: UpdateChecklistItemInput | FormData
): Promise<ActionResult<ChecklistItem>> {
  if (!isValidUuid(itemId)) {
    return { data: null, error: 'Invalid item identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const validated = validateUpdateChecklistItemInput(input);
  if (validated.error || !validated.value) {
    return { data: null, error: validated.error ?? 'Invalid checklist update input.' };
  }

  const { data, error } = await supabase
    .from('checklist_items')
    .update(validated.value)
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select(CHECKLIST_COLUMNS)
    .single();

  if (error) {
    return { data: null, error: 'Failed to update checklist item.' };
  }

  if (!data) {
    return { data: null, error: 'Checklist item not found or access denied.' };
  }

  revalidateTripPaths(data.trip_id);
  return { data: data as ChecklistItem, error: null };
}

/**
 * Deletes a checklist item owned by the authenticated user.
 */
export async function deleteChecklistItem(
  itemId: string
): Promise<ActionResult<{ id: string; deleted: boolean }>> {
  if (!isValidUuid(itemId)) {
    return { data: null, error: 'Invalid item identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const { data, error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select('id, trip_id')
    .maybeSingle();

  if (error) {
    return { data: null, error: 'Failed to delete checklist item.' };
  }

  if (!data) {
    return { data: null, error: 'Checklist item not found or access denied.' };
  }

  revalidateTripPaths(data.trip_id);
  return { data: { id: data.id, deleted: true }, error: null };
}

// ============================================================================
// Budget Entry Server Actions
// ============================================================================

/**
 * Fetches all budget entries for a specific trip owned by the authenticated user.
 */
export async function getTripBudget(
  tripId: string
): Promise<ActionResult<BudgetEntry[]>> {
  if (!isValidUuid(tripId)) {
    return { data: null, error: 'Invalid trip identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const isOwner = await verifyTripOwnership(supabase, tripId, user.id);
  if (!isOwner) {
    return { data: null, error: 'Trip not found or access denied.' };
  }

  const { data, error } = await supabase
    .from('budget_entries')
    .select(BUDGET_COLUMNS)
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: 'Failed to load budget entries.' };
  }

  const entries: BudgetEntry[] = (data ?? []).map((entry) => ({
    ...entry,
    amount: Number(entry.amount),
  }));

  return { data: entries, error: null };
}

/**
 * Adds a new expense entry to a trip owned by the authenticated user.
 */
export async function addBudgetEntry(
  input: CreateBudgetEntryInput | FormData
): Promise<ActionResult<BudgetEntry>> {
  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const validated = validateCreateBudgetEntryInput(input);
  if (validated.error || !validated.value) {
    return { data: null, error: validated.error ?? 'Invalid budget input.' };
  }

  const isOwner = await verifyTripOwnership(
    supabase,
    validated.value.trip_id,
    user.id
  );
  if (!isOwner) {
    return { data: null, error: 'Trip not found or access denied.' };
  }

  const { data, error } = await supabase
    .from('budget_entries')
    .insert({
      trip_id: validated.value.trip_id,
      user_id: user.id,
      category: validated.value.category,
      amount: validated.value.amount,
      currency: validated.value.currency,
      note: validated.value.note,
      entry_date: validated.value.entry_date,
    })
    .select(BUDGET_COLUMNS)
    .single();

  if (error) {
    if (error.code === '23514') {
      return { data: null, error: 'Expense amount must be non-negative.' };
    }
    return { data: null, error: 'Failed to add budget entry.' };
  }

  revalidateTripPaths(validated.value.trip_id);

  return {
    data: {
      ...(data as BudgetEntry),
      amount: Number(data.amount),
    },
    error: null,
  };
}

/**
 * Updates an expense entry owned by the authenticated user.
 */
export async function updateBudgetEntry(
  entryId: string,
  input: UpdateBudgetEntryInput | FormData
): Promise<ActionResult<BudgetEntry>> {
  if (!isValidUuid(entryId)) {
    return { data: null, error: 'Invalid entry identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const validated = validateUpdateBudgetEntryInput(input);
  if (validated.error || !validated.value) {
    return { data: null, error: validated.error ?? 'Invalid budget update input.' };
  }

  const { data, error } = await supabase
    .from('budget_entries')
    .update(validated.value)
    .eq('id', entryId)
    .eq('user_id', user.id)
    .select(BUDGET_COLUMNS)
    .single();

  if (error) {
    if (error.code === '23514') {
      return { data: null, error: 'Expense amount must be non-negative.' };
    }
    return { data: null, error: 'Failed to update budget entry.' };
  }

  if (!data) {
    return { data: null, error: 'Budget entry not found or access denied.' };
  }

  revalidateTripPaths(data.trip_id);

  return {
    data: {
      ...(data as BudgetEntry),
      amount: Number(data.amount),
    },
    error: null,
  };
}

/**
 * Deletes an expense entry owned by the authenticated user.
 */
export async function deleteBudgetEntry(
  entryId: string
): Promise<ActionResult<{ id: string; deleted: boolean }>> {
  if (!isValidUuid(entryId)) {
    return { data: null, error: 'Invalid entry identifier.' };
  }

  const { supabase, user, error: authError } = await getAuthenticatedContext();
  if (authError || !user) {
    return { data: null, error: authError ?? 'Authentication required.' };
  }

  const { data, error } = await supabase
    .from('budget_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', user.id)
    .select('id, trip_id')
    .maybeSingle();

  if (error) {
    return { data: null, error: 'Failed to delete budget entry.' };
  }

  if (!data) {
    return { data: null, error: 'Budget entry not found or access denied.' };
  }

  revalidateTripPaths(data.trip_id);
  return { data: { id: data.id, deleted: true }, error: null };
}
