-- Run this once in Supabase Dashboard → SQL Editor (copy all, then Run)
-- Fixes: missing columns or "Could not find the table 'public.profiles' in the schema cache"

-- 1. Create table if not exists
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  email text,
  full_name text,
  phone text,
  address text,
  loyalty_points integer not null default 0 check (loyalty_points >= 0),
  loyalty_tier text not null default 'bronze',
  role text not null default 'user' check (role in ('user', 'staff', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Ensure columns exist (for existing tables)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists loyalty_points integer not null default 0;
alter table public.profiles add column if not exists loyalty_tier text not null default 'bronze';
alter table public.profiles add column if not exists role text not null default 'user';

-- 3. Ensure indexes
create index if not exists profiles_user_id_idx on public.profiles (user_id);

-- 4. Trigger for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 5. Enable RLS
alter table public.profiles enable row level security;

-- 6. Clean up old policies (to avoid duplication or conflicts)
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_service_role_all" on public.profiles;

-- 7. Logged-in users: own row only
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 8. Backend NestJS with SUPABASE_SERVICE_ROLE_KEY
create policy "profiles_service_role_all"
  on public.profiles for all
  to service_role
  using (true)
  with check (true);
