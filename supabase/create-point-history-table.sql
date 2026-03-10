-- Point history: each add or exchange is recorded. Run in Supabase SQL Editor.
create table if not exists public.point_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  type text not null check (type in ('add', 'exchange')),
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default now()
);

create index if not exists point_history_user_id_idx on public.point_history (user_id);
create index if not exists point_history_created_at_idx on public.point_history (user_id, created_at desc);

alter table public.point_history enable row level security;

create policy "Users can read own point_history"
  on public.point_history for select
  using (auth.uid() = user_id);

create policy "Service can insert point_history"
  on public.point_history for insert
  to authenticated
  with check (auth.uid() = user_id);
