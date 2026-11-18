/**
 * a) Module Name: Profile Auto-Creation Trigger & Core Data Rules Migration
 * b) Date of Code: November 18, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Adds automatic profile creation on user signup (email and Google OAuth),
 *    backfills profile rows for all existing auth.users, enforces trip date ordering,
 *    adds automatic updated_at timestamp triggers, and creates performance indexes.
 * e) Important Functions & Rules:
 *    - public.handle_new_user(): Trigger function executed AFTER INSERT on auth.users to insert
 *      a matching row into public.profiles (mapping full_name/name and avatar_url/picture).
 *    - public.set_updated_at(): Trigger function executed BEFORE UPDATE to keep updated_at current.
 *    - trips_valid_date_range: CHECK constraint ensuring end_date >= start_date when both are set.
 * f) Important Data Structures:
 *    - Indexes on public.trips (user_id, start_date) and public.profiles (email) for fast lookups.
 * g) Algorithm & Justification:
 *    - Database-level AFTER INSERT trigger with SECURITY DEFINER and locked search_path guarantees
 *      every user (Email, Google OAuth, or Admin-created) receives a public.profiles row atomically
 *      in the same transaction, preventing foreign-key failures when creating trips.
 */

-- ============================================================================
-- 1. Automatic updated_at timestamp trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_trips_updated_at ON public.trips;
CREATE TRIGGER set_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2. Automatic profile creation on signup (Email & Google OAuth)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'avatar_url'), ''),
      NULLIF(trim(NEW.raw_user_meta_data->>'picture'), '')
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. Backfill profiles for any existing auth.users rows
-- ============================================================================
INSERT INTO public.profiles (id, email, display_name, avatar_url)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(
    NULLIF(trim(u.raw_user_meta_data->>'full_name'), ''),
    NULLIF(trim(u.raw_user_meta_data->>'name'), ''),
    split_part(COALESCE(u.email, ''), '@', 1)
  ),
  COALESCE(
    NULLIF(trim(u.raw_user_meta_data->>'avatar_url'), ''),
    NULLIF(trim(u.raw_user_meta_data->>'picture'), '')
  )
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. Ensure profiles has a complete INSERT RLS policy for self-management
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert their own profile.'
  ) THEN
    CREATE POLICY "Users can insert their own profile."
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- ============================================================================
-- 5. Basic data integrity rules on trips
-- ============================================================================
ALTER TABLE public.trips
  DROP CONSTRAINT IF EXISTS trips_valid_date_range;

ALTER TABLE public.trips
  ADD CONSTRAINT trips_valid_date_range
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);

-- ============================================================================
-- 6. Performance indexes for owner and date queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON public.profiles (email);

CREATE INDEX IF NOT EXISTS idx_trips_user_id
  ON public.trips (user_id);

CREATE INDEX IF NOT EXISTS idx_trips_user_start_date
  ON public.trips (user_id, start_date DESC);
