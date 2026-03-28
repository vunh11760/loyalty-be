-- Migrate existing auth.users into public.profiles
-- Run once in Supabase Dashboard → SQL Editor (after create-profiles-table.sql)
-- Creates one profile per auth user that doesn't have a profile yet.
-- Includes email from auth.users.

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text not null default 'user';

insert into public.profiles (
  user_id,
  email,
  full_name,
  phone,
  loyalty_points,
  loyalty_tier,
  role
)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', null),
  coalesce(u.raw_user_meta_data->>'phone', null),
  0,
  'bronze',
  'user'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.user_id = u.id
);

-- Profiles that already existed (or were inserted without email): sync email from auth.users
update public.profiles p
set email = u.email
from auth.users u
where p.user_id = u.id
  and (p.email is null or btrim(p.email) = '')
  and u.email is not null;
