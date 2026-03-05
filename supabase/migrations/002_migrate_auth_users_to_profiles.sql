-- Migrate existing auth.users into public.profiles
-- Run once in Supabase Dashboard → SQL Editor (after create-profiles-table.sql)
-- Creates one profile per auth user that doesn't have a profile yet.

insert into public.profiles (
  user_id,
  full_name,
  phone,
  loyalty_points,
  loyalty_tier
)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', null),
  coalesce(u.raw_user_meta_data->>'phone', null),
  0,
  'bronze'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.user_id = u.id
);
