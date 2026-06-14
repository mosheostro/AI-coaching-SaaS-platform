-- =============================================================
-- Coach Online — Admin / Owner platform management (migration 0006)
-- Adds ops columns + owner profile, platform settings, audit log,
-- security events, notifications, analytics events, CRM/leads fields.
-- =============================================================

-- ---------- profiles: ops / admin columns ----------
alter table profiles
  add column if not exists status text not null default 'active'
    check (status in ('active','suspended')),
  add column if not exists must_change_password boolean not null default false,
  add column if not exists last_seen_at timestamptz,
  add column if not exists suspended_at timestamptz,
  add column if not exists suspended_reason text,
  add column if not exists is_demo boolean not null default false;

create index if not exists idx_profiles_role_created on profiles(role, created_at desc);
create index if not exists idx_profiles_status on profiles(status);

-- ---------- Owner profile (singleton public profile) ----------
create table if not exists owner_profile (
  id boolean primary key default true check (id),
  full_name text not null default '',
  display_name text not null default '',
  email text not null default '',
  phone text,
  avatar_url text,
  bio text,
  languages text[] not null default '{}',
  social_links jsonb not null default '{}'::jsonb,
  website text,
  contact text,
  updated_at timestamptz not null default now()
);
insert into owner_profile (id) values (true) on conflict (id) do nothing;

-- ---------- Platform settings (singleton, grouped jsonb) ----------
create table if not exists platform_settings (
  id boolean primary key default true check (id),
  branding jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  languages jsonb not null default '{"default":"en","enabled":["en","ru","he"]}'::jsonb,
  email jsonb not null default '{}'::jsonb,
  notifications jsonb not null default '{}'::jsonb,
  social jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into platform_settings (id) values (true) on conflict (id) do nothing;

-- ---------- Admin audit log ----------
create table if not exists admin_audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references profiles(id) on delete set null,
  actor_email text,
  action text not null,
  target_type text,
  target_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_time on admin_audit_log(created_at desc);

-- ---------- Security events ----------
create table if not exists security_events (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  email text,
  user_id uuid references profiles(id) on delete set null,
  ip text,
  user_agent text,
  meta jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_sec_time on security_events(created_at desc);
create index if not exists idx_sec_type on security_events(type, created_at desc);

-- ---------- Notifications ----------
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  audience text not null default 'user' check (audience in ('user','admin','platform')),
  kind text not null default 'info',
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notif_user on notifications(user_id, created_at desc);
create index if not exists idx_notif_aud on notifications(audience, created_at desc);

-- ---------- Analytics events (traffic / funnel / content) ----------
create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  path text,
  user_id uuid references profiles(id) on delete set null,
  source text,
  medium text,
  referrer text,
  country text,
  device text,
  browser text,
  locale text,
  meta jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_ae_time on analytics_events(created_at desc);
create index if not exists idx_ae_type_time on analytics_events(event_type, created_at desc);
create index if not exists idx_ae_path on analytics_events(path);

-- ---------- contact_messages -> CRM / leads ----------
alter table contact_messages
  add column if not exists type text not null default 'contact'
    check (type in ('contact','partnership','collaboration','support')),
  add column if not exists status text not null default 'new'
    check (status in ('new','in_progress','closed')),
  add column if not exists assigned_to uuid references profiles(id) on delete set null,
  add column if not exists internal_notes text,
  add column if not exists responded_at timestamptz,
  add column if not exists is_demo boolean not null default false;
create index if not exists idx_contact_status on contact_messages(status, created_at desc);

-- ---------- ai_sessions analytics columns ----------
alter table ai_sessions
  add column if not exists status text not null default 'active'
    check (status in ('active','completed','abandoned')),
  add column if not exists topic text,
  add column if not exists rating int check (rating between 1 and 5),
  add column if not exists message_count int not null default 0,
  add column if not exists is_demo boolean not null default false;
create index if not exists idx_ai_sessions_status on ai_sessions(status, created_at desc);

-- ---------- coach_profiles approval + rating ----------
alter table coach_profiles
  add column if not exists approval_status text not null default 'approved'
    check (approval_status in ('pending','approved','rejected')),
  add column if not exists rating numeric(3,2),
  add column if not exists rating_count int not null default 0;

-- ---------- coaching_sessions demo flag ----------
alter table coaching_sessions add column if not exists is_demo boolean not null default false;

-- =============================================================
-- Definer logging helpers (callable by app with anon/auth session)
-- =============================================================
create or replace function public.log_security_event(
  p_type text, p_email text, p_ip text, p_user_agent text, p_meta jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = public as $fn$
begin
  insert into security_events(type, email, ip, user_agent, meta)
  values (p_type, p_email, p_ip, p_user_agent, coalesce(p_meta, '{}'::jsonb));
end;
$fn$;

create or replace function public.track_event(
  p_type text, p_path text, p_source text, p_country text,
  p_device text, p_browser text, p_locale text, p_meta jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = public as $fn$
begin
  insert into analytics_events(event_type, path, user_id, source, country, device, browser, locale, meta)
  values (p_type, p_path, auth.uid(), p_source, p_country, p_device, p_browser, p_locale, coalesce(p_meta, '{}'::jsonb));
end;
$fn$;

grant execute on function public.log_security_event(text,text,text,text,jsonb) to anon, authenticated;
grant execute on function public.track_event(text,text,text,text,text,text,text,jsonb) to anon, authenticated;

-- =============================================================
-- RLS
-- =============================================================
alter table owner_profile enable row level security;
create policy "owner profile public read" on owner_profile for select using (true);
create policy "owner profile admin write" on owner_profile for all
  using (is_admin()) with check (is_admin());

alter table platform_settings enable row level security;
create policy "settings public read" on platform_settings for select using (true);
create policy "settings admin write" on platform_settings for all
  using (is_admin()) with check (is_admin());

alter table admin_audit_log enable row level security;
create policy "audit admin read" on admin_audit_log for select using (is_admin());
create policy "audit admin insert" on admin_audit_log for insert with check (is_admin());

alter table security_events enable row level security;
create policy "sec admin read" on security_events for select using (is_admin());
create policy "sec admin write" on security_events for all
  using (is_admin()) with check (is_admin());

alter table notifications enable row level security;
create policy "notif read" on notifications for select
  using (user_id = auth.uid() or (audience in ('admin','platform') and is_admin()));
create policy "notif own update" on notifications for update using (user_id = auth.uid());
create policy "notif admin all" on notifications for all
  using (is_admin()) with check (is_admin());

alter table analytics_events enable row level security;
create policy "ae admin read" on analytics_events for select using (is_admin());
create policy "ae admin write" on analytics_events for all
  using (is_admin()) with check (is_admin());

-- updated_at triggers for singletons
create trigger trg_owner_updated before update on owner_profile
  for each row execute function set_updated_at();
create trigger trg_settings_updated before update on platform_settings
  for each row execute function set_updated_at();

-- ---------- Admin read access to AI tables (owner-only in 0004) ----------
create policy "ai sessions admin read" on ai_sessions for select using (is_admin());
create policy "ai messages admin read" on ai_messages for select using (is_admin());
create policy "ai memories admin read" on ai_memories for select using (is_admin());
