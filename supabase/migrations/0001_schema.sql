-- =============================================================
-- Coach Online — Schema
-- Run order: 0001_schema.sql → 0002_rls.sql → 0003_storage.sql
-- =============================================================

create extension if not exists "uuid-ossp";

-- ---------- Enums ----------
create type user_role as enum ('coach', 'client', 'admin');
create type session_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
create type task_status as enum ('assigned', 'in_progress', 'submitted', 'approved', 'returned');
create type subscription_tier as enum ('free', 'pro', 'studio');
create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled');
create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

-- ---------- Profiles (one per auth user) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role user_role not null default 'client',
  full_name text not null default '',
  avatar_url text,
  locale text not null default 'en' check (locale in ('en', 'ru', 'he')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table coach_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  bio text,
  specialty text,
  hourly_rate_cents integer check (hourly_rate_cents >= 0),
  timezone text not null default 'UTC'
);

create table client_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  goals text,
  timezone text not null default 'UTC'
);

-- ---------- Tenancy: coach ↔ client link ----------
create table coach_clients (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references profiles(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  started_at timestamptz not null default now(),
  unique (coach_id, client_id)
);

-- ---------- Sessions ----------
create table coaching_sessions (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references profiles(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  duration_min integer not null default 60 check (duration_min between 15 and 480),
  status session_status not null default 'scheduled',
  meeting_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table session_notes (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references coaching_sessions(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  is_private boolean not null default false, -- private = coach-only
  created_at timestamptz not null default now()
);

-- ---------- Tasks / homework ----------
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references profiles(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status task_status not null default 'assigned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table task_submissions (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references tasks(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  content text,
  attachment_path text, -- supabase storage path in 'attachments' bucket
  submitted_at timestamptz not null default now(),
  feedback text,
  reviewed_at timestamptz
);

-- ---------- Messaging ----------
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references profiles(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (coach_id, client_id)
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null check (length(content) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- ---------- Billing ----------
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  tier subscription_tier not null default 'free',
  status subscription_status not null default 'active',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status payment_status not null default 'pending',
  stripe_payment_intent_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Progress ----------
create table progress_metrics (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references profiles(id) on delete cascade,
  coach_id uuid not null references profiles(id) on delete cascade,
  metric_key text not null,             -- e.g. 'weight_kg', 'sessions_done', 'confidence_1_10'
  value numeric not null,
  note text,
  recorded_at timestamptz not null default now()
);

-- ---------- Indexes ----------
create index idx_coach_clients_coach on coach_clients(coach_id);
create index idx_coach_clients_client on coach_clients(client_id);
create index idx_sessions_coach_time on coaching_sessions(coach_id, scheduled_at);
create index idx_sessions_client_time on coaching_sessions(client_id, scheduled_at);
create index idx_session_notes_session on session_notes(session_id);
create index idx_tasks_coach on tasks(coach_id, status);
create index idx_tasks_client on tasks(client_id, status);
create index idx_submissions_task on task_submissions(task_id);
create index idx_conversations_coach on conversations(coach_id);
create index idx_conversations_client on conversations(client_id);
create index idx_messages_conversation_time on messages(conversation_id, created_at);
create index idx_subscriptions_user on subscriptions(user_id);
create index idx_payments_user on payments(user_id);
create index idx_progress_client_key_time on progress_metrics(client_id, metric_key, recorded_at);

-- ---------- updated_at trigger ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();
create trigger trg_sessions_updated before update on coaching_sessions
  for each row execute function set_updated_at();
create trigger trg_tasks_updated before update on tasks
  for each row execute function set_updated_at();
create trigger trg_subscriptions_updated before update on subscriptions
  for each row execute function set_updated_at();

-- ---------- New-user trigger: auth.users → profiles ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role user_role;
begin
  v_role := coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'client');
  insert into public.profiles (id, email, role, full_name, locale)
  values (
    new.id,
    new.email,
    v_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'locale', 'en')
  );
  if v_role = 'coach' then
    insert into public.coach_profiles (id) values (new.id);
    insert into public.subscriptions (user_id, tier) values (new.id, 'free');
  elsif v_role = 'client' then
    insert into public.client_profiles (id) values (new.id);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Auto-create conversation when coach adds a client ----------
create or replace function public.handle_new_coach_client()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.conversations (coach_id, client_id)
  values (new.coach_id, new.client_id)
  on conflict (coach_id, client_id) do nothing;
  return new;
end;
$$;

create trigger on_coach_client_created
  after insert on coach_clients
  for each row execute function public.handle_new_coach_client();

-- ---------- Realtime ----------
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table coaching_sessions;
