/**
 * a) Module Name: Trip Child Tables & Row-Level Security Migration
 * b) Date of Code: November 18, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Database migration establishing relational child tables for
 *    itinerary_items, checklist_items, and budget_entries, each tied to public.trips
 *    with cascade deletions, strict RLS ownership policies, performance indexes, and
 *    automated updated_at timestamp triggers.
 * e) Important Tables & Policies:
 *    - public.itinerary_items: Activities & events with start/end timestamps (powers Itinerary & Calendar).
 *    - public.checklist_items: Packing and pre-trip todo items with completion state and category.
 *    - public.budget_entries: Non-negative expense tracking by category and currency.
 *    - Child Table RLS: Dual-layer enforcement requiring auth.uid() = user_id AND parent trip ownership.
 * f) Important Data Structures:
 *    - UUID foreign keys cascading ON DELETE to maintain clean referential integrity.
 *    - TIMESTAMPTZ and NUMERIC(10,2) precision types for timestamps and financial accuracy.
 * g) Algorithm & Justification:
 *    - Parent Ownership Verification in RLS: Child INSERT/UPDATE policies use an EXISTS subquery
 *      against public.trips to verify that the target trip belongs to the authenticated user. This
 *      prevents malicious users from injecting child records into other users' private trips.
 */

-- ============================================================================
-- 1. Itinerary Items Table (Powers both Itinerary view & Calendar view)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.itinerary_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  location text,
  category text, -- flight, hotel, food, culture, sightseeing, activity, etc.
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  notes text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT itinerary_items_valid_time_range
    CHECK (end_time IS NULL OR end_time >= start_time)
);

-- ============================================================================
-- 2. Checklist Items Table (Packing lists & pre-trip preparation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label text NOT NULL,
  category text, -- packing, documents, health, bookings, etc.
  is_completed boolean DEFAULT false NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- ============================================================================
-- 3. Budget Entries Table (Trip expense tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.budget_entries (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL, -- lodging, flights, food, transport, activities, miscellaneous
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  note text,
  entry_date date,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT budget_entries_non_negative_amount
    CHECK (amount >= 0)
);

-- ============================================================================
-- 4. Automatic updated_at triggers
-- ============================================================================
DROP TRIGGER IF EXISTS set_itinerary_items_updated_at ON public.itinerary_items;
CREATE TRIGGER set_itinerary_items_updated_at
  BEFORE UPDATE ON public.itinerary_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_checklist_items_updated_at ON public.checklist_items;
CREATE TRIGGER set_checklist_items_updated_at
  BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_budget_entries_updated_at ON public.budget_entries;
CREATE TRIGGER set_budget_entries_updated_at
  BEFORE UPDATE ON public.budget_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 5. Row-Level Security (RLS) Enablement
-- ============================================================================
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_entries ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS Policies: Itinerary Items
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own itinerary items." ON public.itinerary_items;
CREATE POLICY "Users can view their own itinerary items."
  ON public.itinerary_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own itinerary items." ON public.itinerary_items;
CREATE POLICY "Users can insert their own itinerary items."
  ON public.itinerary_items FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own itinerary items." ON public.itinerary_items;
CREATE POLICY "Users can update their own itinerary items."
  ON public.itinerary_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own itinerary items." ON public.itinerary_items;
CREATE POLICY "Users can delete their own itinerary items."
  ON public.itinerary_items FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS Policies: Checklist Items
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own checklist items." ON public.checklist_items;
CREATE POLICY "Users can view their own checklist items."
  ON public.checklist_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own checklist items." ON public.checklist_items;
CREATE POLICY "Users can insert their own checklist items."
  ON public.checklist_items FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own checklist items." ON public.checklist_items;
CREATE POLICY "Users can update their own checklist items."
  ON public.checklist_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own checklist items." ON public.checklist_items;
CREATE POLICY "Users can delete their own checklist items."
  ON public.checklist_items FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS Policies: Budget Entries
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own budget entries." ON public.budget_entries;
CREATE POLICY "Users can view their own budget entries."
  ON public.budget_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own budget entries." ON public.budget_entries;
CREATE POLICY "Users can insert their own budget entries."
  ON public.budget_entries FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own budget entries." ON public.budget_entries;
CREATE POLICY "Users can update their own budget entries."
  ON public.budget_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own budget entries." ON public.budget_entries;
CREATE POLICY "Users can delete their own budget entries."
  ON public.budget_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. Performance Indexes
-- ============================================================================
-- Itinerary: lookups by trip and chrono sorting for itinerary / calendar
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id
  ON public.itinerary_items (trip_id);

CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_start
  ON public.itinerary_items (trip_id, start_time ASC);

CREATE INDEX IF NOT EXISTS idx_itinerary_items_user_id
  ON public.itinerary_items (user_id);

-- Checklist: lookups by trip and ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_checklist_items_trip_id
  ON public.checklist_items (trip_id);

CREATE INDEX IF NOT EXISTS idx_checklist_items_trip_sort
  ON public.checklist_items (trip_id, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_checklist_items_user_id
  ON public.checklist_items (user_id);

-- Budget: lookups by trip and ordered by entry_date
CREATE INDEX IF NOT EXISTS idx_budget_entries_trip_id
  ON public.budget_entries (trip_id);

CREATE INDEX IF NOT EXISTS idx_budget_entries_trip_date
  ON public.budget_entries (trip_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_budget_entries_user_id
  ON public.budget_entries (user_id);
