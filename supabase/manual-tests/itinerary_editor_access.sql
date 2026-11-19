begin;

set local role authenticated;

do $$
declare
  account_a uuid := 'cf84a74e-0a50-45ac-9559-4fcc017af102';
  account_b uuid := '804b2a25-dd9a-4971-ab13-8b201d9b13dd';
  test_trip_id uuid;
  test_activity_id uuid;
  affected_rows integer;
begin
  if account_a = account_b then
    raise exception 'Use two different test accounts';
  end if;

  -- Account A creates the trip.
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', account_a, 'role', 'authenticated'
    )::text,
    true
  );

  insert into public.trips (user_id, title, destination)
  values (account_a, 'Editor Test Trip', 'Tokyo, Japan')
  returning id into test_trip_id;

  -- Owner grants Account B editor access.
  insert into public.trip_members (trip_id, user_id, role)
  values (test_trip_id, account_b, 'editor');

  -- Switch to Account B.
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', account_b, 'role', 'authenticated'
    )::text,
    true
  );

  if private.itinerary_trip_role(test_trip_id)
      is distinct from 'editor' then
    raise exception 'FAILED: Editor role not assigned';
  end if;

  if not exists (
    select 1 from public.trips where id = test_trip_id
  ) then
    raise exception 'FAILED: Editor cannot read shared trip';
  end if;

  -- Editor adds an activity.
  insert into public.activities (trip_id, title, activity_date)
  values (test_trip_id, 'Editor Test Activity', '2027-05-12')
  returning id into test_activity_id;

  -- Editor updates the activity.
  update public.activities
  set title = 'Updated by Editor'
  where id = test_activity_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'FAILED: Editor cannot update activity';
  end if;

  -- Editor deletes the activity.
  delete from public.activities
  where id = test_activity_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'FAILED: Editor cannot delete activity';
  end if;

  -- Editor must NOT change trip details.
  update public.trips
  set title = 'Unauthorized change'
  where id = test_trip_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'FAILED: Editor changed trip details';
  end if;

  -- Editor must NOT delete the trip.
  delete from public.trips
  where id = test_trip_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'FAILED: Editor deleted the trip';
  end if;
end;
$$;

select 'Editor activity and trip permission tests passed' as result;

rollback;