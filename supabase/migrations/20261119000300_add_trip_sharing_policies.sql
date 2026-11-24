begin;

-- Keep permission helpers outside the public API schema.
create schema if not exists private;

-- Returns the current user's role for one trip:
-- owner, viewer, editor, or NULL when access is not granted.
create function private.itinerary_trip_role(target_trip_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select
    case
      when t.user_id = (select auth.uid()) then 'owner'
      else m.role
    end
  from public.trips t
  left join public.trip_members m
    on m.trip_id = t.id
    and m.user_id = (select auth.uid())
  where t.id = target_trip_id;
$$;

revoke all
  on function private.itinerary_trip_role(uuid)
  from public, anon, authenticated;

grant usage on schema private to authenticated;

grant execute
  on function private.itinerary_trip_role(uuid)
  to authenticated;

-- Explicit application permissions; RLS still controls rows.
revoke all on table public.trips
  from anon, authenticated;

grant select, insert, update, delete
  on table public.trips
  to authenticated;

grant select, insert, update, delete
  on table public.trip_members
  to authenticated;

-- Existing owner policies remain.
-- Add read access for explicitly invited users.
create policy "Members can view shared trips"
  on public.trips
  for select
  to authenticated
  using (
    private.itinerary_trip_role(id) in ('viewer', 'editor')
  );

-- Owners see their trip's membership list.
-- Members see only their own membership record.
create policy "View permitted trip memberships"
  on public.trip_members
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or private.itinerary_trip_role(trip_id) = 'owner'
  );

-- Only the trip owner can grant access.
create policy "Owners can add trip members"
  on public.trip_members
  for insert
  to authenticated
  with check (
    private.itinerary_trip_role(trip_id) = 'owner'
    and user_id <> (select auth.uid())
  );

-- Only the trip owner can change membership roles.
create policy "Owners can update trip members"
  on public.trip_members
  for update
  to authenticated
  using (
    private.itinerary_trip_role(trip_id) = 'owner'
  )
  with check (
    private.itinerary_trip_role(trip_id) = 'owner'
    and user_id <> (select auth.uid())
  );

-- Only the trip owner can revoke access.
create policy "Owners can remove trip members"
  on public.trip_members
  for delete
  to authenticated
  using (
    private.itinerary_trip_role(trip_id) = 'owner'
  );

commit;