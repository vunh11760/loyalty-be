-- Fix RLS on public.profiles for Nest backend + logged-in clients
-- Run in Supabase SQL Editor after 001_create_profiles (or anytime policies need refresh)

alter table public.profiles enable row level security;

-- Remove old policies (names may vary)
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Service role full access profiles" on public.profiles;

-- Logged-in users (JWT with role authenticated): own row only
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

-- Backend using service_role key: full access (PostgREST often bypasses RLS for service_role;
-- this policy helps if your setup still evaluates RLS for server-side calls.)
create policy "profiles_service_role_all"
  on public.profiles for all
  to service_role
  using (true)
  with check (true);
