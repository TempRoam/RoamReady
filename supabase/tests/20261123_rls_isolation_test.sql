/**
 * a) Module Name: Two-Account Row-Level Security (RLS) Isolation Test
 * b) Date of Code: November 23, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Automated PostgreSQL test suite verifying that Row-Level Security
 *    policies physically isolate tenant data. Simulates two distinct authenticated users
 *    (User A and User B) and validates that User B cannot read, update, delete, or inject
 *    child records into User A's trips, itinerary activities, checklists, or budget entries.
 * e) Tested Security Invariants:
 *    - Invariant 1: Cross-user trip isolation on SELECT (User B receives 0 rows for User A's trips).
 *    - Invariant 2: Cross-user child item isolation on SELECT (itinerary, checklist, budget return 0 rows).
 *    - Invariant 3: Cross-user trip mutation denial (UPDATE and DELETE affect 0 rows).
 *    - Invariant 4: Injection attack denial (User B cannot insert child items into User A's trip).
 *    - Invariant 5: Cross-user child item mutation denial (UPDATE and DELETE affect 0 rows).
 * f) Test Execution:
 *    - Can be executed directly in the Supabase Dashboard SQL Editor.
 *    - Uses an isolated transaction block (DO $$ ... $$) and automatically cleans up test data.
 * g) Algorithm & Justification:
 *    - Session Claim Impersonation: Leverages PostgreSQL set_config to manipulate request.jwt.claims
 *      in local scope, executing queries exactly as Supabase PostgREST does for authenticated JWT tokens.
 */

DO $$
DECLARE
  v_user_a_id uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
  v_user_b_id uuid := 'b0000000-0000-0000-0000-000000000002'::uuid;
  v_trip_a_id uuid;
  v_itin_a_id uuid;
  v_check_a_id uuid;
  v_budg_a_id uuid;

  v_read_count integer;
  v_updated_rows integer;
  v_deleted_rows integer;
  v_injection_blocked boolean := false;
BEGIN
  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'STARTING ROAMREADY TWO-ACCOUNT RLS ISOLATION VERIFICATION TEST';
  RAISE NOTICE '====================================================================';

  -- --------------------------------------------------------------------------
  -- STEP 1: Setup Mock User Profiles in public.profiles (Bypassing RLS as admin)
  -- --------------------------------------------------------------------------
  PERFORM set_config('role', 'postgres', true);

  -- Clean up any leftover artifacts from prior test runs
  DELETE FROM public.profiles WHERE id IN (v_user_a_id, v_user_b_id);

  INSERT INTO public.profiles (id, email, display_name)
  VALUES
    (v_user_a_id, 'alice.test@roamready.internal', 'Alice Test'),
    (v_user_b_id, 'bob.test@roamready.internal', 'Bob Test');

  -- --------------------------------------------------------------------------
  -- STEP 2: Authenticate as User A (Alice) and populate Trip & Child Records
  -- --------------------------------------------------------------------------
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', v_user_a_id), true);

  -- Insert Alice's Trip
  INSERT INTO public.trips (user_id, title, destination, start_date, end_date, description)
  VALUES (v_user_a_id, 'Alice Paris Trip', 'Paris, France', '2027-06-01', '2027-06-10', 'Private trip')
  RETURNING id INTO v_trip_a_id;

  -- Insert Alice's Itinerary Item
  INSERT INTO public.itinerary_items (trip_id, user_id, title, location, category, start_time, end_time)
  VALUES (v_trip_a_id, v_user_a_id, 'Eiffel Tower Visit', 'Champ de Mars', 'sightseeing', '2027-06-02 10:00:00+00', '2027-06-02 12:00:00+00')
  RETURNING id INTO v_itin_a_id;

  -- Insert Alice's Checklist Item
  INSERT INTO public.checklist_items (trip_id, user_id, label, category, is_completed)
  VALUES (v_trip_a_id, v_user_a_id, 'Renew Passport', 'documents', false)
  RETURNING id INTO v_check_a_id;

  -- Insert Alice's Budget Entry
  INSERT INTO public.budget_entries (trip_id, user_id, category, amount, currency, note)
  VALUES (v_trip_a_id, v_user_a_id, 'flights', 850.00, 'USD', 'Air France non-stop')
  RETURNING id INTO v_budg_a_id;

  -- Verify Alice can read her own records
  SELECT count(*) INTO v_read_count FROM public.trips WHERE id = v_trip_a_id;
  IF v_read_count != 1 THEN
    RAISE EXCEPTION 'SETUP FAILED: Alice could not read her own created trip.';
  END IF;

  RAISE NOTICE '[OK] Setup completed: Alice created Trip (%), Itinerary (%), Checklist (%), Budget (%)',
    v_trip_a_id, v_itin_a_id, v_check_a_id, v_budg_a_id;

  -- --------------------------------------------------------------------------
  -- STEP 3: Switch Context to User B (Bob) — Attack Vectors
  -- --------------------------------------------------------------------------
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', v_user_b_id), true);

  -- TEST 1: Cross-User Trip SELECT
  SELECT count(*) INTO v_read_count FROM public.trips WHERE id = v_trip_a_id;
  IF v_read_count != 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH [TEST 1]: Bob was able to view Alice''s private trip!';
  ELSE
    RAISE NOTICE '[PASS] Test 1: Cross-User Trip SELECT blocked (0 rows returned to Bob).';
  END IF;

  -- TEST 2: Cross-User Child Collections SELECT
  SELECT count(*) INTO v_read_count FROM public.itinerary_items WHERE trip_id = v_trip_a_id;
  IF v_read_count != 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH [TEST 2]: Bob was able to view Alice''s itinerary items!';
  END IF;

  SELECT count(*) INTO v_read_count FROM public.checklist_items WHERE trip_id = v_trip_a_id;
  IF v_read_count != 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH [TEST 2]: Bob was able to view Alice''s checklist items!';
  END IF;

  SELECT count(*) INTO v_read_count FROM public.budget_entries WHERE trip_id = v_trip_a_id;
  IF v_read_count != 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH [TEST 2]: Bob was able to view Alice''s budget entries!';
  END IF;
  RAISE NOTICE '[PASS] Test 2: Cross-User Child Collections SELECT blocked (0 rows across all 3 child tables).';

  -- TEST 3: Cross-User Trip UPDATE
  UPDATE public.trips
  SET title = 'HACKED BY BOB'
  WHERE id = v_trip_a_id;
  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
  IF v_updated_rows != 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH [TEST 3]: Bob was able to update Alice''s trip title!';
  ELSE
    RAISE NOTICE '[PASS] Test 3: Cross-User Trip UPDATE blocked (0 rows modified).';
  END IF;

  -- TEST 4: Cross-User Trip DELETE
  DELETE FROM public.trips
  WHERE id = v_trip_a_id;
  GET DIAGNOSTICS v_deleted_rows = ROW_COUNT;
  IF v_deleted_rows != 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH [TEST 4]: Bob was able to delete Alice''s trip!';
  ELSE
    RAISE NOTICE '[PASS] Test 4: Cross-User Trip DELETE blocked (0 rows modified).';
  END IF;

  -- TEST 5: Child Item Injection Attack
  -- Bob attempts to insert an itinerary item into Alice's trip, claiming it as his own or Alice's
  BEGIN
    INSERT INTO public.itinerary_items (trip_id, user_id, title, start_time)
    VALUES (v_trip_a_id, v_user_b_id, 'Malicious Injection Event', '2027-06-03 14:00:00+00');
    v_injection_blocked := false;
  EXCEPTION WHEN insufficient_privilege OR row_security_active THEN
    v_injection_blocked := true;
  END;

  IF NOT v_injection_blocked THEN
    -- Check if it somehow bypassed exception but was dropped by policy
    SELECT count(*) INTO v_read_count FROM public.itinerary_items WHERE trip_id = v_trip_a_id AND title = 'Malicious Injection Event';
    IF v_read_count > 0 THEN
      RAISE EXCEPTION 'SECURITY BREACH [TEST 5]: Bob successfully injected a child item into Alice''s trip!';
    ELSE
      v_injection_blocked := true;
    END IF;
  END IF;
  RAISE NOTICE '[PASS] Test 5: Child Item Injection Attack blocked by trip ownership RLS policy.';

  -- TEST 6: Cross-User Child Item UPDATE
  UPDATE public.checklist_items
  SET is_completed = true
  WHERE id = v_check_a_id;
  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
  IF v_updated_rows != 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH [TEST 6]: Bob was able to modify Alice''s checklist item!';
  ELSE
    RAISE NOTICE '[PASS] Test 6: Cross-User Child Item UPDATE blocked (0 rows modified).';
  END IF;

  -- TEST 7: Cross-User Child Item DELETE
  DELETE FROM public.budget_entries
  WHERE id = v_budg_a_id;
  GET DIAGNOSTICS v_deleted_rows = ROW_COUNT;
  IF v_deleted_rows != 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH [TEST 7]: Bob was able to delete Alice''s budget entry!';
  ELSE
    RAISE NOTICE '[PASS] Test 7: Cross-User Child Item DELETE blocked (0 rows modified).';
  END IF;

  -- --------------------------------------------------------------------------
  -- STEP 4: Cleanup Mock Data (as superuser)
  -- --------------------------------------------------------------------------
  PERFORM set_config('role', 'postgres', true);
  DELETE FROM public.profiles WHERE id IN (v_user_a_id, v_user_b_id);

  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'ALL 7 RLS ISOLATION TESTS PASSED SUCCESSFULLY! ZERO DATA LEAKAGE.';
  RAISE NOTICE '====================================================================';
END;
$$;
