/**
 * a) Module Name: Trip Data Types & Interfaces
 * b) Date of Code: November 18, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: TypeScript domain definitions and database models for trips,
 *    itinerary items, packing checklists, and budget entries, providing end-to-end
 *    type safety for Server Actions and UI integration contracts.
 * e) Important Types & Data Structures:
 *    - Trip: Core trip model reflecting public.trips schema.
 *    - ItineraryItem: Chronological activity model with time bounds and category.
 *    - ChecklistItem: Pre-trip preparation and packing item with toggle state.
 *    - BudgetEntry: Expense tracking record with category, amount, and currency.
 *    - TripWithDetails: Composite object aggregating a trip and all its child collections.
 *    - ActionResult<T>: Standardized asynchronous mutation/query result envelope.
 * f) Parameters & Properties:
 *    - All timestamps modeled as ISO 8601 strings in UTC.
 *    - All database primary and foreign keys modeled as UUID strings.
 * g) Algorithm & Justification:
 *    - Result Envelope Pattern (ActionResult<T>): Returning { data, error } instead of throwing
 *      unhandled exceptions across Next.js Server Action boundaries ensures graceful error handling
 *      on the client without crashing React component trees.
 */

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type ItineraryCategory =
  | 'flight'
  | 'hotel'
  | 'food'
  | 'culture'
  | 'sightseeing'
  | 'activity'
  | 'transport'
  | 'other';

export interface ItineraryItem {
  id: string;
  trip_id: string;
  user_id: string;
  title: string;
  location: string | null;
  category: ItineraryCategory | string | null;
  start_time: string;
  end_time: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type ChecklistCategory =
  | 'packing'
  | 'documents'
  | 'health'
  | 'finance'
  | 'bookings'
  | 'pre-trip'
  | 'other';

export interface ChecklistItem {
  id: string;
  trip_id: string;
  user_id: string;
  label: string;
  category: ChecklistCategory | string | null;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type BudgetCategory =
  | 'lodging'
  | 'flights'
  | 'food'
  | 'transport'
  | 'activities'
  | 'shopping'
  | 'miscellaneous';

export interface BudgetEntry {
  id: string;
  trip_id: string;
  user_id: string;
  category: BudgetCategory | string;
  amount: number;
  currency: string;
  note: string | null;
  entry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripWithDetails extends Trip {
  itinerary_items: ItineraryItem[];
  checklist_items: ChecklistItem[];
  budget_entries: BudgetEntry[];
}

export interface CreateTripInput {
  title: string;
  destination: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

export interface UpdateTripInput {
  title?: string;
  destination?: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

export interface CreateItineraryItemInput {
  trip_id: string;
  title: string;
  location?: string | null;
  category?: ItineraryCategory | string | null;
  start_time: string;
  end_time?: string | null;
  notes?: string | null;
  sort_order?: number;
}

export interface UpdateItineraryItemInput {
  title?: string;
  location?: string | null;
  category?: ItineraryCategory | string | null;
  start_time?: string;
  end_time?: string | null;
  notes?: string | null;
  sort_order?: number;
}

export interface CreateChecklistItemInput {
  trip_id: string;
  label: string;
  category?: ChecklistCategory | string | null;
  is_completed?: boolean;
  sort_order?: number;
}

export interface UpdateChecklistItemInput {
  label?: string;
  category?: ChecklistCategory | string | null;
  is_completed?: boolean;
  sort_order?: number;
}

export interface CreateBudgetEntryInput {
  trip_id: string;
  category: BudgetCategory | string;
  amount: number;
  currency?: string;
  note?: string | null;
  entry_date?: string | null;
}

export interface UpdateBudgetEntryInput {
  category?: BudgetCategory | string;
  amount?: number;
  currency?: string;
  note?: string | null;
  entry_date?: string | null;
}

export interface ActionResult<T> {
  data: T | null;
  error: string | null;
}
