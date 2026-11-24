begin;

set local role authenticated;

do $$
declare
  account_a uuid := 'b0a0c850-e8b2-408b-8275-78dd907ec08c';
  account_b uuid := '804b2a25-dd9a-4971-ab13-8b201d9b13dd';
  test_trip_id uuid;
  test_activity_id uuid;
  affected_rows integer;
begin
  if account_a = account_b then
    raise exception 'Use two different test accounts';
  end if;

 
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', account_a, 'role', 'authenticated'
    )::text,
    true
  );

  insert into public.trips (user_id, title, destination)
  values (account_a, 'Viewer Test Trip', 'Tokyo, Japan')
  returning id into test_trip_id;

  insert into public.activities (trip_id, title, activity_date)
  values (test_trip_id, 'Viewer Test Activity', '2027-05-12')
  returning id into test_activity_id;


  insert into public.trip_members (trip_id, user_id)
  values (test_trip_id, account_b);


  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', account_b, 'role', 'authenticated'
    )::text,
    true
  );

  if private.itinerary_trip_role(test_trip_id)
      is distinct from 'viewer' then
    raise exception 'FAILED: Membership did not default to viewer';
  end if;

  if not exists (
    select 1 from public.trips where id = test_trip_id
  ) then
    raise exception 'FAILED: Viewer cannot read shared trip';
  end if;

  if not exists (
    select 1 from public.activities where id = test_activity_id
  ) then
    raise exception 'FAILED: Viewer cannot read activity';
  end if;

  update public.trips
  set title = 'Unauthorized change'
  where id = test_trip_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'FAILED: Viewer edited the trip';
  end if;

  update public.activities
  set title = 'Unauthorized change'
  where id = test_activity_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'FAILED: Viewer edited an activity';
  end if;

  delete from public.activities
  where id = test_activity_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'FAILED: Viewer deleted an activity';
  end if;

  delete from public.trips
  where id = test_trip_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'FAILED: Viewer deleted the trip';
  end if;
end;
$$;

select 'Viewer read, update, and delete tests passed' as result;

rollback;