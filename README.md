## Loyalty Backend (NestJS + Supabase OTP)

This is a minimal NestJS API that provides **email OTP authentication using Supabase**.

### 1. Environment setup

- **Copy env example**:

```bash
cp .env.example .env
```

- **Fill in `.env`** with your Supabase project details:
  - `SUPABASE_URL` – your project URL (e.g. `https://xxx.supabase.co`)
  - `SUPABASE_ANON_KEY` – your anon public key from Supabase
  - Optional: change `PORT` if you don't want `3000`

### 2. Install dependencies

```bash
npm install
```

### 3. Run the API

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

- **Swagger (API docs)**
  - Local: [http://localhost:3000/docs](http://localhost:3000/docs)
  - Production: `https://<your-render-url>/docs` (e.g. `https://loyalty-be.onrender.com/docs`)

### 4. Auth endpoints

- **Request OTP**
  - **POST** `/auth/request-otp`
  - **Body**:
    ```json
    { "email": "user@example.com" }
    ```
  - Sends an email OTP using Supabase.

- **Verify OTP**
  - **POST** `/auth/verify-otp`
  - **Body**:
    ```json
    { "email": "user@example.com", "token": "123456" }
    ```
  - Returns Supabase session tokens and user info on success.

### 5. Supabase database (profiles / loyalty)

- **Create the `profiles` table** (fixes "Could not find the table 'public.profiles' in the schema cache"):
  1. Open your **Supabase** project (the same one in `.env` as `SUPABASE_URL`).
  2. Go to **SQL Editor** in the left sidebar.
  3. Click **New query**, then copy the SQL below, paste it, and click **Run**.
  4. Confirm: go to **Table Editor** and you should see a table named **`profiles`**.

```sql
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text,
  phone text,
  loyalty_points integer not null default 0 check (loyalty_points >= 0),
  loyalty_tier text not null default 'bronze',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_user_id_idx on public.profiles (user_id);
create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
alter table public.profiles enable row level security;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = user_id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
```
- **Optional:** set `SUPABASE_SERVICE_ROLE_KEY` in `.env` (Settings → API → service_role) so the backend can create/update profiles.
- **Profile endpoints** (require `Authorization: Bearer <access_token>`): **GET** `/profile/me`, **PUT** `/profile/me` (body: `fullName`, `phone`, `loyaltyPoints`, `loyaltyTier`).

### 6. Auth guard (token from Supabase)

Protected routes require a valid Supabase **access token** in the header:

```http
Authorization: Bearer <access_token>
```

The token is the `accessToken` returned from **POST** `/auth/verify-otp`. The guard validates it with Supabase and attaches the user to the request.

- **Protected routes**: **GET** `/profile/me`, **PUT** `/profile/me` (use `@UseGuards(SupabaseAuthGuard)` and `@CurrentUser()`).
- **Example**
  ```bash
  curl -X GET http://localhost:3000/profile/me -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  ```

To protect other controllers, add `@UseGuards(SupabaseAuthGuard)` and use `@CurrentUser()` to get the authenticated user.

### 7. Deploy on Render

- **Root Directory**: leave blank (repo root).
- **Build Command**: `npm run render:build`
- **Start Command**: `npm start`
- Set `SUPABASE_URL`, `SUPABASE_ANON_KEY` (and optionally `SUPABASE_SERVICE_ROLE_KEY`) in the dashboard. If you see "Cannot find module ... dist/main.js", check the Build logs and fix any TypeScript or install errors.

