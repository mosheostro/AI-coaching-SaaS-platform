-- Remove ALL demo data created by demo_seed.sql.
begin;
delete from auth.users where email like 'demo+%@demo.coachonline.dev';  -- cascades to profiles + dependents
delete from analytics_events where is_demo;
delete from security_events where is_demo;
delete from notifications where is_demo;
delete from contact_messages where is_demo;
delete from coaching_sessions where is_demo;  -- safety (also cascaded)
commit;
