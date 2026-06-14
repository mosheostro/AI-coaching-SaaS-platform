# Admin / Owner Dashboard — setup

Phase 1 ships the foundation: schema, demo data, a premium responsive admin
shell, the executive Overview, full User Management, plus Coaches, Clients,
AI analytics, Analytics/BI, Leads CRM, Security center, Notifications,
Settings, Owner profile, and a Content placeholder.

## 1. Apply the migration
Run in the Supabase SQL editor (or `supabase db push`), in order:
`0001 → 0002 → 0003 → 0004 → 0005 → 0006_admin.sql`

`0006_admin.sql` adds: ops columns on `profiles` (status, last_seen_at,
must_change_password, suspend fields), `owner_profile`, `platform_settings`,
`admin_audit_log`, `security_events`, `notifications`, `analytics_events`,
CRM fields on `contact_messages`, analytics columns on `ai_sessions`,
approval/rating on `coach_profiles`, the `log_security_event` / `track_event`
helpers, RLS, and admin read access to the AI tables.

## 2. Load demo data (optional, for development/demos)
Run `supabase/seed/demo_seed.sql` in the SQL editor. It creates ~90 users
(coaches + clients), human + AI sessions, leads, 90 days of analytics/funnel
events, security events, progress metrics, and admin alerts — all tagged
`is_demo` so dashboards look fully operational.

Remove it anytime with `supabase/seed/demo_teardown.sql`.

## 3. Create the admin user
Supabase auth is email-based, so the "admin/admin" account becomes an email +
temporary password that must be rotated on first login:

1. Supabase → Authentication → Users → **Add user**
   - Email: `admin@coachonline.local` (or your real email)
   - Password: a temporary one, e.g. `ChangeMe123!`  (must meet 8+ char,
     letter+number policy)
   - Auto-confirm: yes
2. Then in the SQL editor:
   ```sql
   update profiles
     set role = 'admin', must_change_password = true
     where email = 'admin@coachonline.local';
   ```
3. Log in → you're redirected to **/admin/account** and a "default credentials"
   warning shows until you set a new password. After changing it,
   `must_change_password` flips to false and the warning disappears.

## 4. Optional env
- `SUPABASE_SERVICE_ROLE_KEY` — enables hard-deleting users from User
  Management (`auth.admin.deleteUser`). Without it, every other admin action
  (suspend, reactivate, role change, password-reset email) still works via RLS;
  delete is simply disabled with a clear message.

## Notes
- Charts are handcrafted inline SVG (`src/components/charts.tsx`) — zero deps.
- Suspended users are signed out and blocked at `requireProfile`.
- Failed/successful logins and password resets are logged to the Security
  center via the `log_security_event` RPC.
- Content CMS (testimonials/FAQ/resources/blog) and profile-photo upload are
  scoped for the next pass.
