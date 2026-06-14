-- =============================================================
-- Coach Online — DEMO DATA SEED (reversible)
-- Every row is tagged is_demo=true (or a demo+ email), so it can be
-- wiped with supabase/seed/demo_teardown.sql before launch.
-- Run AFTER migrations 0001–0006, in the Supabase SQL editor.
-- =============================================================

begin;

-- ---- Teardown any previous demo run (idempotent) ----
delete from auth.users where email like 'demo+%@demo.coachonline.dev';
delete from analytics_events where is_demo;
delete from security_events where is_demo;
delete from notifications where is_demo;
delete from contact_messages where is_demo;

do $seed$
declare
  first_names text[] := array['Maya','Daniel','Sofia','Noah','Lena','Adam','Yael','Leo','Anna','Ivan','Ruth','Omer','Tania','David','Mira','Sasha','Nina','Eli','Dana','Boris','Rina','Gleb','Tova','Igor','Shira','Max','Vera','Amit','Olga','Ron'];
  last_names  text[] := array['Cohen','Levi','Ivanov','Petrov','Friedman','Katz','Mizrahi','Sokolov','Bar','Goldberg','Romanov','Azoulay','Volkov','Peretz','Smirnov','Adler','Kuznetsov','Shapiro','Orlov','Dahan'];
  topics      text[] := array['Stress & burnout','Career transition','Relationships','Confidence','Sleep & energy','Nutrition habits','Leadership','Focus & ADHD','Anxiety','Life purpose','Work-life balance','Mindfulness'];
  countries   text[] := array['IL','US','RU','DE','GB','FR','CA','UA','NL','ES'];
  devices     text[] := array['desktop','desktop','desktop','mobile','mobile','mobile','mobile','tablet'];
  browsers    text[] := array['Chrome','Chrome','Chrome','Safari','Safari','Firefox','Edge'];
  sources     text[] := array['organic','organic','direct','social','social','referral'];
  locs        text[] := array['en','en','ru','ru','he'];
  uid uuid;
  v_role user_role;
  v_created timestamptz;
  fname text;
  i int; j int;
  n_users int := 90;
  coach_ids uuid[];
  client_ids uuid[];
  c uuid; cl uuid;
  s_status session_status;
  ai_stat text;
begin
  -- ---- Users (creates auth.users; the on_auth_user_created trigger makes profiles) ----
  for i in 1..n_users loop
    fname := first_names[1+floor(random()*array_length(first_names,1))::int] || ' ' ||
             last_names[1+floor(random()*array_length(last_names,1))::int];
    if random() < 0.3 then v_role := 'coach'; else v_role := 'client'; end if;
    v_created := now() - ((power(random(),1.6)*120) || ' days')::interval - ((random()*86400) || ' seconds')::interval;
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'demo+'||i||'@demo.coachonline.dev', '',
      v_created, v_created, v_created,
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', fname, 'role', v_role::text, 'locale', locs[1+floor(random()*array_length(locs,1))::int]),
      '', '', '', ''
    );
    update profiles set
      is_demo = true,
      created_at = v_created,
      last_seen_at = case when random() < 0.8 then now() - ((random()*20) || ' days')::interval else v_created end,
      status = case when random() < 0.06 then 'suspended' else 'active' end
    where id = uid;
  end loop;

  -- ---- Coach approval mix + ratings ----
  update coach_profiles set
    approval_status = case when random() < 0.15 then 'pending' when random() < 0.05 then 'rejected' else 'approved' end,
    rating = round((3.6 + random()*1.4)::numeric, 2),
    rating_count = (5 + floor(random()*60))::int
  where id in (select id from profiles where is_demo and role = 'coach');

  select array_agg(id) into coach_ids  from profiles where is_demo and role = 'coach' and status = 'active';
  select array_agg(id) into client_ids from profiles where is_demo and role = 'client';

  -- ---- Coach<->client links, human sessions, progress ----
  if coach_ids is not null and client_ids is not null then
    for i in 1..array_length(client_ids,1) loop
      cl := client_ids[i];
      c  := coach_ids[1+floor(random()*array_length(coach_ids,1))::int];
      insert into coach_clients(coach_id, client_id, status, started_at)
        values (c, cl, 'active', now() - ((random()*90)||' days')::interval)
        on conflict (coach_id, client_id) do nothing;
      for j in 1..(1+floor(random()*6))::int loop
        s_status := (array['scheduled','completed','completed','completed','cancelled','no_show']::session_status[])[1+floor(random()*6)::int];
        insert into coaching_sessions(coach_id, client_id, title, scheduled_at, duration_min, status, is_demo)
        values (c, cl,
          (array['Weekly check-in','Goal setting','Deep dive','Review & plan','Accountability'])[1+floor(random()*5)::int],
          now() - ((random()*80)||' days')::interval + ((random()*40)||' days')::interval,
          (array[30,45,60,60,90])[1+floor(random()*5)::int], s_status, true);
      end loop;
      for j in 1..(2+floor(random()*5))::int loop
        insert into progress_metrics(client_id, coach_id, metric_key, value, recorded_at)
        values (cl, c,
          (array['confidence_1_10','sleep_hours','energy_1_10','sessions_done'])[1+floor(random()*4)::int],
          round((random()*10)::numeric,1), now() - ((random()*70)||' days')::interval);
      end loop;
    end loop;
  end if;

  -- ---- AI coaching sessions ----
  for i in 1..240 loop
    select id into uid from profiles where is_demo order by random() limit 1;
    v_created := now() - ((power(random(),1.4)*100)||' days')::interval;
    ai_stat := (array['completed','completed','completed','completed','abandoned','active'])[1+floor(random()*6)::int];
    insert into ai_sessions(user_id, mode, title, status, topic, rating, message_count, is_demo, created_at, updated_at)
    values (uid,
      (array['life','wellness','career','relationships','leadership','mindfulness','nutrition','goals']::ai_coach_mode[])[1+floor(random()*8)::int],
      'Session', ai_stat, topics[1+floor(random()*array_length(topics,1))::int],
      case when ai_stat='completed' then (3+floor(random()*3))::int else null end,
      case when ai_stat='abandoned' then (1+floor(random()*3))::int else (4+floor(random()*20))::int end,
      true, v_created, v_created);
  end loop;

  -- ---- Leads / contact messages ----
  for i in 1..44 loop
    insert into contact_messages(name, email, subject, message, page, delivered, type, status, is_demo, created_at)
    values (first_names[1+floor(random()*array_length(first_names,1))::int],
      'lead'||i||'@example.com',
      (array['Coaching inquiry','Partnership','Press','Support needed','Collaboration'])[1+floor(random()*5)::int],
      'Demo lead message for the pipeline.',
      (array['contact','partnerships','speaking','support'])[1+floor(random()*4)::int],
      random() < 0.7,
      (array['contact','contact','partnership','collaboration','support'])[1+floor(random()*5)::int],
      (array['new','new','in_progress','closed'])[1+floor(random()*4)::int],
      true, now() - ((random()*60)||' days')::interval);
  end loop;

  -- ---- Analytics: pageviews ----
  for i in 1..4200 loop
    v_created := now() - ((power(random(),1.3)*90)||' days')::interval - ((random()*86400)||' seconds')::interval;
    insert into analytics_events(event_type, path, source, country, device, browser, locale, is_demo, created_at)
    values ('pageview',
      (array['/','/','/','/about','/ai-coach','/demo','/contact','/speaking','/media','/partnerships'])[1+floor(random()*10)::int],
      sources[1+floor(random()*array_length(sources,1))::int],
      countries[1+floor(random()*array_length(countries,1))::int],
      devices[1+floor(random()*array_length(devices,1))::int],
      browsers[1+floor(random()*array_length(browsers,1))::int],
      locs[1+floor(random()*array_length(locs,1))::int],
      true, v_created);
  end loop;

  -- ---- Analytics: funnel events ----
  for i in 1..900 loop
    v_created := now() - ((power(random(),1.3)*90)||' days')::interval;
    insert into analytics_events(event_type, path, source, country, device, is_demo, created_at)
    values ((array['signup','activation','profile_complete','first_session','returning'])[1+floor(random()*5)::int],
      '/signup',
      sources[1+floor(random()*array_length(sources,1))::int],
      countries[1+floor(random()*array_length(countries,1))::int],
      devices[1+floor(random()*array_length(devices,1))::int], true, v_created);
  end loop;

  -- ---- Security events ----
  for i in 1..130 loop
    v_created := now() - ((random()*30)||' days')::interval;
    insert into security_events(type, email, ip, user_agent, is_demo, created_at)
    values ((array['failed_login','failed_login','failed_login','lockout','password_reset','login'])[1+floor(random()*6)::int],
      'demo+'||(1+floor(random()*n_users))::int||'@demo.coachonline.dev',
      (floor(random()*255)::int||'.'||floor(random()*255)::int||'.'||floor(random()*255)::int||'.'||floor(random()*255)::int),
      'Mozilla/5.0', true, v_created);
  end loop;

  -- ---- Admin notifications / alerts ----
  insert into notifications(audience, kind, title, body, is_demo, created_at) values
    ('admin','alert','Traffic spike detected','Pageviews up 38% vs last week.', true, now() - interval '2 hours'),
    ('admin','warning','Registration dip','New signups down 12% over 3 days.', true, now() - interval '1 day'),
    ('admin','lead','New partnership request','A new partnership lead just arrived.', true, now() - interval '5 hours'),
    ('admin','support','Support request open','A user is awaiting a reply.', true, now() - interval '3 hours'),
    ('admin','info','Weekly report ready','Your weekly analytics summary is available.', true, now() - interval '6 hours');

  raise notice 'Demo seed complete: % users', n_users;
end;
$seed$;

commit;
