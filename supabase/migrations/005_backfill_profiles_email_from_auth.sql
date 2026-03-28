-- Backfill public.profiles.email from auth.users when the profile row is missing email.
-- Safe to run multiple times (idempotent).
-- Some profiles were created without email; auth.users is the source of truth.

update public.profiles p
set email = u.email
from auth.users u
where p.user_id = u.id
  and (p.email is null or btrim(p.email) = '')
  and u.email is not null;
