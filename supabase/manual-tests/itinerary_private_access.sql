begin;

set local role authenticated;

do $$
declare
  account_a uuid := 'b0a0c850-e8b2-408b-8275-78dd907ec08c';
  account_b uuid := '804b2a25-dd9a-4971-ab13-8b201d9b13dd';
  test_trip_id uuid;
  test_activity_id uuid;
begin
  if account_a = account_b then
    raise exception 'Use two different test accounts';
  end if;

  -- Act as Account A: the trip owner.
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', account_a,
      'role', 'authenticated'
    )::text,
    true
  );

  insert into public.trips (
    user_id, title, destination, start_date, end_date
  )
  values (
    account_a,
    'Privacy Test Trip',
    'Tokyo, Japan',
    '2027-05-12',
    '2027-05-16'
  )
  returning id into test_trip_id;

  insert into public.activities (
    trip_id, title, activity_date, start_time, category
  )
  values (
    test_trip_id,
    'Test Temple Visit',
    '2027-05-12',
    '09:00',
    'culture'
  )
  returning id into test_activity_id;

  -- Confirm the owner can read both records.
  if not exists (
    select 1 from public.trips
    where id = test_trip_id
  ) then
    raise exception 'FAILED: Owner cannot read their trip';
  end if;

  if not exists (
    select 1 from public.activities
    where id = test_activity_id
  ) then
    raise exception 'FAILED: Owner cannot read their activity';
  end if;

  -- Act as Account B, who has NOT been invited.
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', account_b,
      'role', 'authenticated'
    )::text,
    true
  );

  if exists (
    select 1 from public.trips
    where id = test_trip_id
  ) then
    raise exception 'FAILED: Uninvited user can read the trip';
  end if;

  if exists (
    select 1 from public.activities
    where id = test_activity_id
  ) then
    raise exception 'FAILED: Uninvited user can read activities';
  end if;
end;
$$;

select 'Private trip visibility tests passed' as result;

rollback;