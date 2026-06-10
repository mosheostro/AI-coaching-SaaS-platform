# Setup & Deployment

## 1. Supabase project

1. Create a project at https://supabase.com/dashboard (choose a region close to your users).
2. Open **SQL Editor** and run, in order:
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_storage.sql`
3. **Authentication → Providers → Email**: keep "Confirm email" ON for production (OFF speeds up local testing).
4. **Authentication → URL Configuration**: set Site URL to your domain (or `http://localhost:3000` for dev).
5. **Project Settings → API**: copy the Project URL and `anon` key.

## 2. Local development

```bash
npm install
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Smoke test: sign up as a coach, sign up as a client (second browser/incognito), coach adds client by email, create a session, assign a task, client submits, coach approves, chat in both windows (realtime).

## 3. Create an admin

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

## 4. Deploy to Vercel

1. Push the repo to GitHub.
2. Vercel → New Project → import repo (framework auto-detected: Next.js).
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; needed later for Stripe webhooks)
4. Deploy. Then set the Vercel URL as Site URL in Supabase Auth settings and add it to Redirect URLs.

## 5. Production checklist

- [ ] Email confirmation ON; configure custom SMTP (Supabase default sender is rate-limited)
- [ ] Site URL + Redirect URLs match production domain
- [ ] RLS smoke test: client A cannot read client B's tasks/messages (try via browser console)
- [ ] Database backups enabled (Supabase → Database → Backups)
- [ ] Rate limiting on auth endpoints (Supabase Auth settings)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed in client bundles
- [ ] Custom domain + HTTPS on Vercel
- [ ] Error monitoring (Sentry) and Vercel Analytics
- [ ] Stripe: create products/prices, webhook → Supabase Edge Function updating `subscriptions`/`payments` (post-MVP)

## Env variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client+server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client+server | Public anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Webhooks/admin jobs — bypasses RLS |
| `STRIPE_SECRET_KEY` | server only | Payments (post-MVP) |
| `STRIPE_WEBHOOK_SECRET` | server only | Webhook signature check (post-MVP) |
