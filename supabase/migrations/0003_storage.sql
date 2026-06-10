-- =============================================================
-- Coach Online — Storage buckets + policies
-- =============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

-- Avatars: anyone reads, owner writes to own folder {user_id}/...
create policy "avatar public read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatar owner write" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar owner update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar owner delete" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Attachments: path convention {owner_user_id}/{filename}
-- Owner full access; the linked coach/client may read.
create policy "attachment owner all" on storage.objects for all
  using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "attachment counterpart read" on storage.objects for select
  using (
    bucket_id = 'attachments'
    and exists (
      select 1 from public.coach_clients cc
      where cc.status = 'active'
        and (
          (cc.coach_id = auth.uid() and cc.client_id::text = (storage.foldername(name))[1])
          or (cc.client_id = auth.uid() and cc.coach_id::text = (storage.foldername(name))[1])
        )
    )
  );
