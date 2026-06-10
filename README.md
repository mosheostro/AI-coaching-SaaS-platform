# Coach Online

SaaS coaching platform: coach + client dashboards, admin panel, sessions, homework, realtime chat, progress tracking. Next.js 15 (App Router) + Supabase. Trilingual UI (EN/RU/HE) with RTL.

See `ARCHITECTURE.md` for system design and `SETUP.md` for step-by-step deployment.

## Stack

- **Frontend:** Next.js 15, TypeScript, TailwindCSS, Server Actions
- **Backend:** Supabase — Postgres, Auth, Realtime, Storage, RLS
- **Hosting:** Vercel

## Structure

```
supabase/migrations/    SQL: schema, RLS, storage (run in order)
src/
  middleware.ts         Session refresh + role-based route guard
  i18n/                 EN/RU/HE dictionaries, cookie locale, RTL
  lib/supabase/         Browser / server / middleware clients
  lib/auth.ts           requireProfile() role guard
  components/           AppShell, ChatThread (realtime), UI primitives
  app/
    (auth)/             /login, /signup + server actions
    dashboard/          Role-based redirect
    coach/              dashboard, clients, sessions, tasks, chat
    client/             dashboard, tasks, sessions, chat
    admin/              users + revenue overview
```

## Quick start

```bash
npm install
cp .env.example .env.local   # fill Supabase keys
npm run dev
```

## Roles

- Signup offers **coach** or **client**; role is stored in `auth.users.raw_user_meta_data` and copied to `profiles` by a DB trigger.
- **Admin** is assigned manually: `update profiles set role = 'admin' where email = '...';`
- Coaches add clients by email (client must sign up first); a conversation is auto-created.
