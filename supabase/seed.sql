/**
 * a) Module Name: RoamReady Demo Seed Script
 * b) Date of Code: November 18, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Idempotent demo database seeding script for RoamReady presentations.
 *    Populates a comprehensive sample trip ("Tokyo Spring Adventure") complete with itinerary
 *    activities, packing checklist items, and budget entries linked to the active demo user.
 * e) Target Schema & Tables:
 *    - public.profiles: Discovers target user by email ('peter.kimberley02@gmail.com' or first profile).
 *    - public.trips: Seeds trip container with start and end dates.
 *    - public.itinerary_items: Chronological activity records (powers Itinerary & Calendar).
 *    - public.checklist_items: Categorized preparation & packing tasks with completion states.
 *    - public.budget_entries: Itemized travel expenses across lodging, flights, food, and activities.
 * f) Important Data Structures:
 *    - DO $$ PL/pgSQL block managing transactional variable assignment and foreign key linkage.
 * g) Algorithm & Justification:
 *    - Dynamic Profile Resolution & Idempotency: Resolves target user ID dynamically from profiles;
 *      deletes existing seed trip with the specific demo title before inserting fresh records,
 *      ensuring repeated runs during grading/demos succeed without violating unique constraints.
 */

DO $$
DECLARE
  v_user_id uuid;
  v_trip_id uuid;
  v_target_email text := 'peter.kimberley02@gmail.com';
BEGIN
  -- 1. Identify target demo profile (prefers user email, falls back to first profile)
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE email = v_target_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id
    FROM public.profiles
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No profile found in public.profiles. Sign up or log in first, then run this seed.';
    RETURN;
  END IF;

  RAISE NOTICE 'Seeding demo data for user: %', v_user_id;

  -- 2. Remove any previous demo trip with this title to ensure clean idempotency
  DELETE FROM public.trips
  WHERE user_id = v_user_id AND title = 'Tokyo Spring Adventure';

  -- 3. Insert demo trip
  INSERT INTO public.trips (
    user_id,
    title,
    destination,
    start_date,
    end_date,
    description
  ) VALUES (
    v_user_id,
    'Tokyo Spring Adventure',
    'Tokyo, Japan',
    CURRENT_DATE + INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '37 days',
    'Cherry blossom season exploration across Shibuya, Asakusa, and Shinjuku with cultural tours and local dining.'
  )
  RETURNING id INTO v_trip_id;

  -- 4. Insert Itinerary Items (Powers both Itinerary and Calendar views)
  INSERT INTO public.itinerary_items (
    trip_id,
    user_id,
    title,
    location,
    category,
    start_time,
    end_time,
    notes,
    sort_order
  ) VALUES
    (
      v_trip_id,
      v_user_id,
      'Flight Arrival & Check-in',
      'Haneda Airport (HND) -> Shinjuku Hotel',
      'flight',
      (CURRENT_DATE + INTERVAL '30 days' + TIME '14:30:00')::timestamptz,
      (CURRENT_DATE + INTERVAL '30 days' + TIME '17:00:00')::timestamptz,
      'Pick up pocket Wi-Fi at airport terminal 3, take Tokyo Monorail to Yamanote Line.',
      1
    ),
    (
      v_trip_id,
      v_user_id,
      'Welcome Dinner in Omoide Yokocho',
      'Omoide Yokocho, Shinjuku',
      'food',
      (CURRENT_DATE + INTERVAL '30 days' + TIME '19:00:00')::timestamptz,
      (CURRENT_DATE + INTERVAL '30 days' + TIME '21:00:00')::timestamptz,
      'Traditional yakitori skewers in atmospheric alleyways.',
      2
    ),
    (
      v_trip_id,
      v_user_id,
      'Senso-ji Temple & Asakusa Walking Tour',
      'Senso-ji, Asakusa',
      'culture',
      (CURRENT_DATE + INTERVAL '31 days' + TIME '09:00:00')::timestamptz,
      (CURRENT_DATE + INTERVAL '31 days' + TIME '12:00:00')::timestamptz,
      'Explore Nakamise Shopping Street and sample fresh melonpan and matcha.',
      3
    ),
    (
      v_trip_id,
      v_user_id,
      'Tsukiji Outer Market Food Tour',
      'Tsukiji, Chuo City',
      'food',
      (CURRENT_DATE + INTERVAL '31 days' + TIME '13:00:00')::timestamptz,
      (CURRENT_DATE + INTERVAL '31 days' + TIME '15:30:00')::timestamptz,
      'Fresh sashimi, tamagoyaki, and street seafood.',
      4
    ),
    (
      v_trip_id,
      v_user_id,
      'Shibuya Crossing & Sky Observation Deck',
      'Shibuya Scramble Square',
      'sightseeing',
      (CURRENT_DATE + INTERVAL '32 days' + TIME '16:00:00')::timestamptz,
      (CURRENT_DATE + INTERVAL '32 days' + TIME '18:30:00')::timestamptz,
      'Sunset view from the rooftop 360 observation deck (tickets pre-booked).',
      5
    ),
    (
      v_trip_id,
      v_user_id,
      'teamLab Planets Digital Art Exhibition',
      'Toyosu, Koto City',
      'activity',
      (CURRENT_DATE + INTERVAL '33 days' + TIME '10:30:00')::timestamptz,
      (CURRENT_DATE + INTERVAL '33 days' + TIME '13:00:00')::timestamptz,
      'Immersive body-interactive digital art exhibits. Wear barefoot-friendly attire.',
      6
    );

  -- 5. Insert Checklist Items (Packing & Pre-trip Tasks)
  INSERT INTO public.checklist_items (
    trip_id,
    user_id,
    label,
    category,
    is_completed,
    sort_order
  ) VALUES
    (v_trip_id, v_user_id, 'Check passport expiration (must be 6+ months valid)', 'documents', true, 1),
    (v_trip_id, v_user_id, 'Purchase digital Suica / Pasmo transit pass for iPhone/Android', 'transport', true, 2),
    (v_trip_id, v_user_id, 'Reserve pocket Wi-Fi router for airport pickup', 'bookings', true, 3),
    (v_trip_id, v_user_id, 'Pack universal plug adapters (US to Japan 2-prong A-type)', 'packing', false, 4),
    (v_trip_id, v_user_id, 'Notify bank / credit cards of international travel', 'finance', false, 5),
    (v_trip_id, v_user_id, 'Pack comfortable walking sneakers (expecting 15k-20k steps/day)', 'packing', false, 6),
    (v_trip_id, v_user_id, 'Download offline Google Maps for Tokyo & Kanto region', 'pre-trip', false, 7);

  -- 6. Insert Budget Entries (Trip Expenses)
  INSERT INTO public.budget_entries (
    trip_id,
    user_id,
    category,
    amount,
    currency,
    note,
    entry_date
  ) VALUES
    (v_trip_id, v_user_id, 'flights', 950.00, 'USD', 'Roundtrip LAX -> HND non-stop flight', CURRENT_DATE - INTERVAL '14 days'),
    (v_trip_id, v_user_id, 'lodging', 1420.00, 'USD', 'Shinjuku Prince Hotel (7 nights)', CURRENT_DATE - INTERVAL '10 days'),
    (v_trip_id, v_user_id, 'activities', 38.00, 'USD', 'teamLab Planets Tokyo admission ticket', CURRENT_DATE - INTERVAL '5 days'),
    (v_trip_id, v_user_id, 'activities', 22.00, 'USD', 'Shibuya Sky sunset observation ticket', CURRENT_DATE - INTERVAL '4 days'),
    (v_trip_id, v_user_id, 'transport', 60.00, 'USD', 'Initial Suica transit card reload', CURRENT_DATE),
    (v_trip_id, v_user_id, 'food', 650.00, 'USD', 'Estimated daily dining & street food budget', CURRENT_DATE);

  RAISE NOTICE 'Successfully seeded Tokyo Spring Adventure (Trip ID: %)', v_trip_id;
END;
$$;
