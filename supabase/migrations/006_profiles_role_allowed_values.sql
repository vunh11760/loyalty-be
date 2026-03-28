-- Restrict profiles.role to: user | staff | admin
-- Run on existing DBs (safe if constraint name is new).

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'staff', 'admin'));
