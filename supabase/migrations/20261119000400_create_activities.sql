begin;

create table public.activities (
  id uuid primary key default gen_random_uuid(),

  trip_id uuid not null
    references public.trips(id)
    on delete cascade,

  title text not null
    check (char_length(trim(title)) between 1 and 200),

  activity_date date not null,

  -- Local time in the trip's time zone.
  start_time time without time zone,

  location text,
  description text,

  category text not null default 'other'
    check (
      category in (
        'culture',
        'food',
        'sightseeing',
        'transportation',
        'accommodation',
        'other'
      )
    ),

  image_url text,

  -- Used to arrange activities within each day.
  sort_order integer not null default 0
    check (sort_order >= 0),

  -- Amount in the parent trip's currency.
  estimated_cost numeric(12, 2) not null default 0
    check (estimated_cost >= 0),

  created_at timestamptz not null default now()
);

create index activities_trip_date_order_idx
  on public.activities (
    trip_id,
    activity_date,
    sort_order,
    id
  );

alter table public.activities
  enable row level security;

revoke all on table public.activities
  from anon, authenticated;

grant select, insert, update, delete
  on table public.activities
  to authenticated;

-- Owners, viewers, and editors can read activities.
create policy "Read accessible trip activities"
  on public.activities
  for select
  to authenticated
  using (
    private.itinerary_trip_role(trip_id)
      in ('owner', 'viewer', 'editor')
  );

-- Only owners and editors can add activities.
create policy "Owners and editors can add activities"
  on public.activities
  for insert
  to authenticated
  with check (
    private.itinerary_trip_role(trip_id)
      in ('owner', 'editor')
  );

-- Check access to both the existing and updated row.
create policy "Owners and editors can update activities"
  on public.activities
  for update
  to authenticated
  using (
    private.itinerary_trip_role(trip_id)
      in ('owner', 'editor')
  )
  with check (
    private.itinerary_trip_role(trip_id)
      in ('owner', 'editor')
  );

create policy "Owners and editors can delete activities"
  on public.activities
  for delete
  to authenticated
  using (
    private.itinerary_trip_role(trip_id)
      in ('owner', 'editor')
  );

commit;  