-- Run in Supabase Dashboard → SQL Editor
-- Creates public.promotions (title, description)

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists promotions_created_at_idx on public.promotions (created_at desc);

create or replace function public.set_promotions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists promotions_updated_at on public.promotions;
create trigger promotions_updated_at
  before update on public.promotions
  for each row execute function public.set_promotions_updated_at();

alter table public.promotions enable row level security;

-- Allow authenticated users to read all promotions
create policy "Authenticated can read promotions"
  on public.promotions for select
  to authenticated
  using (true);

-- Allow authenticated users to insert/update/delete (or restrict by role if needed)
create policy "Authenticated can insert promotions"
  on public.promotions for insert
  to authenticated
  with check (true);

create policy "Authenticated can update promotions"
  on public.promotions for update
  to authenticated
  using (true);

create policy "Authenticated can delete promotions"
  on public.promotions for delete
  to authenticated
  using (true);
