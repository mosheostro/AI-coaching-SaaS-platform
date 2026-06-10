-- =============================================================
-- Coach Online — Row Level Security (deny-by-default)
-- =============================================================

-- ---------- Helper functions ----------
create or replace function public.my_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_coach_of(p_client uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from coach_clients
    where coach_id = auth.uid() and client_id = p_client and status = 'active'
  );
$$;

create or replace function public.in_conversation(p_conversation uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from conversations
    where id = p_conversation and (coach_id = auth.uid() or client_id = auth.uid())
  );
$$;

-- Coach adds a client by email (avoids opening profile reads to search)
create or replace function public.add_client_by_email(p_email text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_client uuid;
  v_link uuid;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'coach') then
    raise exception 'only coaches can add clients';
  end if;

  select id into v_client from profiles where lower(email) = lower(p_email) and role = 'client';
  if v_client is null then
    raise exception 'no client account found for %', p_email;
  end if;

  insert into coach_clients (coach_id, client_id)
  values (auth.uid(), v_client)
  on conflict (coach_id, client_id) do update set status = 'active'
  returning id into v_link;

  return v_link;
end;
$$;

-- ---------- Enable RLS everywhere ----------
alter table profiles enable row level security;
alter table coach_profiles enable row level security;
alter table client_profiles enable row level security;
alter table coach_clients enable row level security;
alter table coaching_sessions enable row level security;
alter table session_notes enable row level security;
alter table tasks enable row level security;
alter table task_submissions enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table progress_metrics enable row level security;

-- ---------- profiles ----------
create policy "own profile read" on profiles for select
  using (id = auth.uid() or is_admin() or is_coach_of(id)
         or exists (select 1 from coach_clients cc where cc.client_id = auth.uid() and cc.coach_id = profiles.id));
create policy "own profile update" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = (select role from profiles p where p.id = auth.uid()));
create policy "admin profile update" on profiles for update
  using (is_admin()) with check (is_admin());

-- ---------- coach_profiles (public directory read) ----------
create policy "coach profile read" on coach_profiles for select using (true);
create policy "coach profile upsert" on coach_profiles for insert with check (id = auth.uid());
create policy "coach profile update" on coach_profiles for update using (id = auth.uid() or is_admin());

-- ---------- client_profiles ----------
create policy "client profile read" on client_profiles for select
  using (id = auth.uid() or is_coach_of(id) or is_admin());
create policy "client profile upsert" on client_profiles for insert with check (id = auth.uid());
create policy "client profile update" on client_profiles for update using (id = auth.uid() or is_admin());

-- ---------- coach_clients ----------
create policy "coach_clients read" on coach_clients for select
  using (coach_id = auth.uid() or client_id = auth.uid() or is_admin());
create policy "coach adds client" on coach_clients for insert
  with check (coach_id = auth.uid() and my_role() = 'coach');
create policy "coach manages link" on coach_clients for update using (coach_id = auth.uid() or is_admin());
create policy "coach removes link" on coach_clients for delete using (coach_id = auth.uid() or is_admin());

-- ---------- coaching_sessions ----------
create policy "sessions read" on coaching_sessions for select
  using (coach_id = auth.uid() or client_id = auth.uid() or is_admin());
create policy "coach creates session" on coaching_sessions for insert
  with check (coach_id = auth.uid() and is_coach_of(client_id));
create policy "coach updates session" on coaching_sessions for update using (coach_id = auth.uid());
create policy "coach deletes session" on coaching_sessions for delete using (coach_id = auth.uid());

-- ---------- session_notes ----------
create policy "notes read" on session_notes for select
  using (
    author_id = auth.uid()
    or is_admin()
    or exists (
      select 1 from coaching_sessions s
      where s.id = session_notes.session_id
        and (s.coach_id = auth.uid() or (s.client_id = auth.uid() and not session_notes.is_private))
    )
  );
create policy "participant writes note" on session_notes for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from coaching_sessions s
      where s.id = session_id and (s.coach_id = auth.uid() or s.client_id = auth.uid())
    )
  );
create policy "author updates note" on session_notes for update using (author_id = auth.uid());
create policy "author deletes note" on session_notes for delete using (author_id = auth.uid());

-- ---------- tasks ----------
create policy "tasks read" on tasks for select
  using (coach_id = auth.uid() or client_id = auth.uid() or is_admin());
create policy "coach assigns task" on tasks for insert
  with check (coach_id = auth.uid() and is_coach_of(client_id));
create policy "coach updates task" on tasks for update using (coach_id = auth.uid());
create policy "client updates own task status" on tasks for update
  using (client_id = auth.uid())
  with check (client_id = auth.uid() and coach_id = tasks.coach_id);
create policy "coach deletes task" on tasks for delete using (coach_id = auth.uid());

-- ---------- task_submissions ----------
create policy "submissions read" on task_submissions for select
  using (
    client_id = auth.uid() or is_admin()
    or exists (select 1 from tasks t where t.id = task_submissions.task_id and t.coach_id = auth.uid())
  );
create policy "client submits" on task_submissions for insert
  with check (
    client_id = auth.uid()
    and exists (select 1 from tasks t where t.id = task_id and t.client_id = auth.uid())
  );
create policy "coach reviews submission" on task_submissions for update
  using (exists (select 1 from tasks t where t.id = task_submissions.task_id and t.coach_id = auth.uid()));

-- ---------- conversations ----------
create policy "conversations read" on conversations for select
  using (coach_id = auth.uid() or client_id = auth.uid() or is_admin());
create policy "coach opens conversation" on conversations for insert
  with check (coach_id = auth.uid() and is_coach_of(client_id));

-- ---------- messages ----------
create policy "messages read" on messages for select
  using (in_conversation(conversation_id) or is_admin());
create policy "participant sends message" on messages for insert
  with check (sender_id = auth.uid() and in_conversation(conversation_id));
create policy "recipient marks read" on messages for update
  using (in_conversation(conversation_id) and sender_id <> auth.uid());

-- ---------- subscriptions (writes only via service role / webhooks) ----------
create policy "own subscription read" on subscriptions for select
  using (user_id = auth.uid() or is_admin());

-- ---------- payments (writes only via service role / webhooks) ----------
create policy "own payments read" on payments for select
  using (user_id = auth.uid() or is_admin());

-- ---------- progress_metrics ----------
create policy "progress read" on progress_metrics for select
  using (client_id = auth.uid() or coach_id = auth.uid() or is_admin());
create policy "progress insert" on progress_metrics for insert
  with check (
    (coach_id = auth.uid() and is_coach_of(client_id))
    or (client_id = auth.uid() and exists (
      select 1 from coach_clients cc
      where cc.client_id = auth.uid() and cc.coach_id = progress_metrics.coach_id and cc.status = 'active'
    ))
  );
create policy "coach updates progress" on progress_metrics for update using (coach_id = auth.uid());
create policy "coach deletes progress" on progress_metrics for delete using (coach_id = auth.uid());
