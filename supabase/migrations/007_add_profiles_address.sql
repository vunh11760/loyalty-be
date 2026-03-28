-- Physical / mailing address for profile (optional)

alter table public.profiles
  add column if not exists address text;
