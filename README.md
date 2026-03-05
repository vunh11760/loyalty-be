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

- **Swagger UI** (API docs): `http://localhost:3000/docs`

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

- **Run the migration** in Supabase Dashboard → **SQL Editor**: open `supabase/migrations/001_create_profiles.sql` and run its contents. This creates the `profiles` table and RLS.
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

