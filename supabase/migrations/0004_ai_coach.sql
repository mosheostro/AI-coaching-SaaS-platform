-- =============================================================
-- Coach Online — AI Coach engine (migration 0004)
-- Sessions, messages, persistent memory
-- =============================================================

create type ai_coach_mode as enum (
  'life', 'integral', 'wellness', 'nutrition', 'relationships',
  'career', 'leadership', 'mindfulness', 'spiritual', 'goals'
);

create type ai_memory_kind as enum (
  'goal', 'value', 'priority', 'theme', 'commitment',
  'achievement', 'milestone', 'summary'
);

create table ai_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  mode ai_coach_mode not null default 'life',
  title text not null default 'New session',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ai_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references ai_sessions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table ai_memories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind ai_memory_kind not null,
  content text not null,
  source_session uuid references ai_sessions(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'done', 'archived')),
  created_at timestamptz not null default now()
);

create index idx_ai_sessions_user on ai_sessions(user_id, updated_at desc);
create index idx_ai_messages_session on ai_messages(session_id, created_at);
create index idx_ai_memories_user_kind on ai_memories(user_id, kind, created_at desc);

create trigger trg_ai_sessions_updated before update on ai_sessions
  for each row execute function set_updated_at();

-- RLS: strictly owner-only
alter table ai_sessions enable row level security;
alter table ai_messages enable row level security;
alter table ai_memories enable row level security;

create policy "own ai sessions" on ai_sessions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own ai messages" on ai_messages for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own ai memories" on ai_memories for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
