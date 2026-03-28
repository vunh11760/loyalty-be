-- Add application role to profiles (default: user)
-- Run in Supabase SQL Editor if the table already exists without this column.

alter table public.profiles
  add column if not exists role text not null default 'user';

update public.profiles
set role = 'user'
where role is null;
