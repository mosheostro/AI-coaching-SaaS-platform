-- =============================================================
-- Coach Online — contact_messages (migration 0005)
-- Every inquiry is stored here even if email delivery fails.
-- =============================================================

create table contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  page text,
  delivered boolean not null default false, -- email provider succeeded
  created_at timestamptz not null default now()
);

create index idx_contact_messages_time on contact_messages(created_at desc);

alter table contact_messages enable row level security;

-- Anyone (including anonymous visitors) may submit a message
create policy "public can insert messages" on contact_messages
  for insert to anon, authenticated with check (true);

-- Only admins may read them (also visible in Supabase Table Editor)
create policy "admin reads messages" on contact_messages
  for select using (is_admin());
