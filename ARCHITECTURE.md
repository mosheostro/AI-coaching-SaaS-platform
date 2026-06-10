# Coach Online — Architecture Brief

## 1. Product Strategy

**Vision.** A premium SaaS platform where independent coaches run their entire practice — clients, sessions, homework, messaging, progress, billing — in one place.

**Users.**
- **Coach** — manages clients, schedules sessions, assigns tasks, tracks progress, gets paid.
- **Client** — attends sessions, completes tasks, chats with coach, sees own progress.
- **Admin** — platform operator: user management, analytics, payments overview.

**MVP scope.** Auth + RBAC, coach/client/admin dashboards, sessions, tasks with submissions, realtime chat, progress metrics, subscription records (Stripe integration stubbed). Out of MVP: video calls, marketplace, mobile apps.

**Value proposition.** Coaches replace 5 tools (Calendly + WhatsApp + Google Docs + Stripe links + spreadsheets) with one branded workspace; clients get accountability and visible progress.

## 2. System Architecture

**Stack.** Next.js 15 (App Router, TypeScript, Server Components + Server Actions), TailwindCSS, Supabase (Postgres + Auth + Realtime + Storage), Vercel hosting.

**Services (logical, all on Supabase + Next.js server actions):**
- **Auth** — Supabase Auth; `profiles.role` drives RBAC; middleware enforces route access.
- **Sessions** — `coaching_sessions` + `session_notes`; coach CRUD, client read.
- **Tasks** — `tasks` + `task_submissions`; coach assigns, client submits, coach reviews.
- **Messaging** — `conversations` + `messages`; Supabase Realtime channel per conversation.
- **Payments** — `subscriptions` + `payments`; Stripe webhooks → Edge Function (stub in MVP).
- **Analytics** — SQL views over sessions/tasks/payments for admin and coach dashboards.

**Multi-tenancy.** Tenant = coach. Every client row links to a coach via `coach_clients`. RLS guarantees a coach sees only their clients' data; a client only their own; admin sees all via `role = 'admin'` policies.

**API layer.** Server Actions for mutations, Server Components for reads (direct Supabase queries under RLS), Supabase Realtime for chat/live updates. No separate REST service needed at MVP scale.

**Storage.** Supabase Storage buckets: `avatars` (public read), `attachments` (session files, task submissions — private, RLS-scoped paths `{coach_id}/...`).

## 3. UX / Design System

**Principles.** Clean SaaS minimalism, generous whitespace, soft neutral palette, no gradient-heavy "AI aesthetic".

- **Typography:** Inter (UI), 14px base, scale 12/14/16/20/24/32. Hebrew renders with system fallback; full RTL support.
- **Color:** Neutral slate scale for surfaces; primary `#4F46E5` (indigo 600) used sparingly; semantic green/amber/red for statuses.
- **Spacing:** 4px grid; cards radius 12px, 1px slate-200 borders, shadow only on overlays.
- **Components:** Button, Input, Card, Badge, Avatar, StatCard, EmptyState, Sidebar, Topbar.
- **i18n:** EN / RU / HE, cookie-based locale, `dir="rtl"` for Hebrew, logical CSS properties (`ms-/me-/ps-/pe-`) throughout.

**Key flows.**
1. *Onboarding:* signup → role select (coach/client) → profile → dashboard.
2. *Coach:* dashboard → client list → schedule session / assign task → review submission → notes.
3. *Client:* dashboard → today's tasks → submit → chat → see progress chart.

## 4. Event Flows

| Event | Reaction |
|---|---|
| SessionCreated | Row insert → client dashboard updates (Realtime) → (later: email/calendar invite) |
| TaskAssigned | Insert → client task list live-updates → due-date surfaced on dashboard |
| TaskCompleted | Submission insert → status `submitted` → coach review queue → `approved` → progress_metrics insert |
| MessageSent | Insert → Realtime broadcast to conversation channel → unread badge |
| SubscriptionActivated | Stripe webhook → Edge Function → upsert `subscriptions` → access gate lifts |
| ProgressUpdated | Metric insert → client/coach charts re-render |

## 5. Business Model

- **Tiers:** Free (1 coach, 3 clients) → Pro $29/mo (unlimited clients, storage) → Studio $79/mo (team coaches, white-label).
- **Coach monetization:** coaches bill clients through the platform (Stripe Connect, post-MVP); platform takes SaaS fee, not commission, at launch.
- **Funnel:** landing → signup → guided onboarding → first session booked within 48h (activation metric) → weekly task loop drives retention.

## 6. Top Risks

1. RLS misconfiguration leaking cross-tenant data — mitigated by deny-by-default policies + tests.
2. Chat scale (Realtime fan-out) — fine at MVP, revisit at >5k concurrent.
3. Stripe webhook reliability — idempotent upserts, signature verification.
4. RTL/i18n regressions — logical properties + per-locale smoke tests.
