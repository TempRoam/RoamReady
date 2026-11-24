begin;

-- Create a profile when a new email account signs up.
create function public.roamready_create_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- The current profile schema requires an email.
  if new.email is null then
    return new;
  end if;

  insert into public.profiles (
    id,
    email,
    display_name,
    avatar_url
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- This function is used by the trigger, not called by clients.
revoke all
  on function public.roamready_create_user_profile()
  from public, anon, authenticated;

create trigger roamready_on_auth_user_created
after insert on auth.users
for each row
execute function public.roamready_create_user_profile();

-- Create missing profiles for existing email accounts.
insert into public.profiles (
  id,
  email,
  display_name,
  avatar_url
)
select
  id,
  email,
  coalesce(
    raw_user_meta_data ->> 'full_name',
    raw_user_meta_data ->> 'name'
  ),
  raw_user_meta_data ->> 'avatar_url'
from auth.users
where email is not null
on conflict (id) do nothing;

commit;