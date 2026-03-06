-- Loyalty levels (tiers) for user points – run in Supabase SQL Editor
create table if not exists public.loyalty_levels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  min_points integer not null default 0 check (min_points >= 0),
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists loyalty_levels_min_points_idx on public.loyalty_levels (min_points desc);
create index if not exists loyalty_levels_sort_order_idx on public.loyalty_levels (sort_order);

create or replace function public.set_loyalty_levels_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists loyalty_levels_updated_at on public.loyalty_levels;
create trigger loyalty_levels_updated_at
  before update on public.loyalty_levels
  for each row execute function public.set_loyalty_levels_updated_at();

alter table public.loyalty_levels enable row level security;

create policy "Authenticated can read loyalty_levels"
  on public.loyalty_levels for select to authenticated using (true);

create policy "Authenticated can insert loyalty_levels"
  on public.loyalty_levels for insert to authenticated with check (true);

create policy "Authenticated can update loyalty_levels"
  on public.loyalty_levels for update to authenticated using (true);

create policy "Authenticated can delete loyalty_levels"
  on public.loyalty_levels for delete to authenticated using (true);

-- Optional: seed default levels
insert into public.loyalty_levels (name, min_points, description, sort_order)
values
  ('Bronze', 0, 'Starter tier', 1),
  ('Silver', 100, '100+ points', 2),
  ('Gold', 500, '500+ points', 3)
on conflict (name) do nothing;
