begin;

-- Extend the existing trips table.
alter table public.trips
  add column time_zone text not null default 'UTC',
  add column accommodation text,
  add column hero_image_url text,
  add column estimated_budget numeric(12, 2),
  add column currency text not null default 'USD',

  add constraint trips_valid_date_range
    check (
      start_date is null
      or end_date is null
      or end_date >= start_date
    ),

  add constraint trips_nonnegative_budget
    check (
      estimated_budget is null
      or estimated_budget >= 0
    ),

  add constraint trips_currency_format
    check (currency ~ '^[A-Z]{3}$');

-- Store access explicitly granted by the trip owner.
create table public.trip_members (
  id uuid primary key default gen_random_uuid(),

  trip_id uuid not null
    references public.trips(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  role text not null default 'viewer'
    check (role in ('viewer', 'editor')),

  created_at timestamptz not null default now(),

  constraint trip_members_unique_user
    unique (trip_id, user_id)
);

create index trip_members_user_id_idx
  on public.trip_members(user_id);

create index trips_user_id_idx
  on public.trips(user_id);

-- Keep membership records inaccessible to app users
-- until the sharing policies are added.
alter table public.trip_members
  enable row level security;

revoke all on table public.trip_members
  from anon, authenticated;

commit;