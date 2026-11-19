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

  -- Account A creates the trip and activity.
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', account_a, 'role', 'authenticated'
    )::text,
    true
  );

  insert into public.trips (user_id, title, destination)
  values (account_a, 'Sharing Control Test', 'Tokyo, Japan')
  returning id into test_trip_id;

  insert into public.activities (trip_id, title, activity_date)
  values (test_trip_id, 'Sharing Test Activity', '2027-05-12')
  returning id into test_activity_id;

  insert into public.trip_members (trip_id, user_id)
  values (test_trip_id, account_b);

  -- Switch to viewer Account B.
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', account_b, 'role', 'authenticated'
    )::text,
    true
  );

  -- A viewer must not promote themselves.
  update public.trip_members
  set role = 'editor'
  where trip_id = test_trip_id
    and user_id = account_b;

  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'FAILED: Viewer changed their own role';
  end if;

  -- A viewer must not manage membership records.
  delete from public.trip_members
  where trip_id = test_trip_id
    and user_id = account_b;

  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'FAILED: Viewer deleted a membership';
  end if;

  -- Switch back to the owner.
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', account_a, 'role', 'authenticated'
    )::text,
    true
  );

  -- Owner can promote the viewer.
  update public.trip_members
  set role = 'editor'
  where trip_id = test_trip_id
    and user_id = account_b;

  get diagnostics affected_rows = row_count;

  if affected_rows <> 1 then
    raise exception 'FAILED: Owner could not change member role';
  end if;

  -- Owner revokes access.
  delete from public.trip_members
  where trip_id = test_trip_id
    and user_id = account_b;

  get diagnostics affected_rows = row_count;

  if affected_rows <> 1 then
    raise exception 'FAILED: Owner could not revoke access';
  end if;

  -- Switch to the removed member.
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', account_b, 'role', 'authenticated'
    )::text,
    true
  );

  if private.itinerary_trip_role(test_trip_id) is not null then
    raise exception 'FAILED: Removed member still has a role';
  end if;

  if exists (
    select 1 from public.trips where id = test_trip_id
  ) then
    raise exception 'FAILED: Removed member can read trip';
  end if;

  if exists (
    select 1 from public.activities where id = test_activity_id
  ) then
    raise exception 'FAILED: Removed member can read activity';
  end if;
end;
$$;

select 'Sharing control and revocation tests passed' as result;

rollback; 