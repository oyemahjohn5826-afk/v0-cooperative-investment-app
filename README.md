# Epicenter Cooperative Society — Investment Platform

A member-facing cooperative investment platform: members register, make deposits /
savings, apply for loans, and track their financial reports; admins manage members,
ledger, loans, announcements, reports, and messages. Built with Next.js (App Router),
React, Supabase (SSR auth), Tailwind CSS, and shadcn/ui.

## Tech stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Auth / DB:** Supabase via `@supabase/ssr` (server + browser clients)
- **Styling:** Tailwind CSS 4 + shadcn/ui components + lucide-react icons + sonner toasts
- **Forms:** react-hook-form + zod
- **Language:** TypeScript (strict; type errors fail the build)

## Scripts

```bash
npm run dev      # start the dev server (http://localhost:3000)
npm run build    # production build (also type-checks)
npm run start    # run the production build
npm run lint     # eslint
```

## Environment variables

Create a `.env.local` in the project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-only — never expose to the client
```

The `SUPABASE_SERVICE_ROLE_KEY` is used only by server-side routes (e.g.
`/api/auth/register`, `/api/auth/whoami`) to read profiles and is never shipped to
the browser.

## Auth model

Supabase handles sessions. Two cookie sets are used:

- **`sb-*`** session cookies — set/refreshed by the auth sync route and middleware.
- **`ec_*`** custom cookies (`ec_role`, `ec_status`, `ec_user_id`, `ec_email`,
  `ec_full_name`) — set by `POST /api/auth/whoami` and consumed by the `/dashboard`
  and `/admin` server-layout route guards.

Login flows (`/auth/member-login`, `/auth/admin-login`) call `/api/auth/whoami` after
sign-in so the route guards see the member's role/status. `POST /api/auth/logout`
clears both cookie sets. Password resets use `/auth/reset-password` (linked from the
forgot-password email).

## Database schema

The version-controlled schema and Row Level Security policies live in
`supabase/migrations/0001_init.sql` (covering `profiles`, `deposits`, `loans`,
`savings`, `announcements`, `contact_messages`, `financial_reports`, `member_fees`,
and `shareholders`). See the header comment in that file — the current DDL was
**inferred from application code and must be reconciled with the live database** before
being applied to any environment.

This repository does **not** apply migrations to the live database. Apply them via the
Supabase CLI (`supabase db push` / `supabase migration up`) against a reconciled schema.

## Project layout

```
app/                 # routes: public site, /auth/*, /dashboard/*, /admin/*, /api/auth/*
components/          # ui + feature components (dashboard, admin, contact form, ...)
lib/supabase/        # server + browser Supabase clients and middleware
supabase/migrations/ # version-controlled DB schema + RLS
```
