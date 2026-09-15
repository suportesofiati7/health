begin;

-- Keep profile-photo writes consistent for both staff profiles and patients.
-- The browser stores only a path; signed URLs remain private.
grant update(avatar_path) on public.memberships, public.patients to authenticated;

drop policy if exists membership_photo_update on public.memberships;
create policy membership_photo_update on public.memberships
for update to authenticated
using (
  organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'::uuid
  and (user_id = auth.uid() or private.has_role(organization_id, array['proprietario']))
)
with check (
  organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'::uuid
  and (user_id = auth.uid() or private.has_role(organization_id, array['proprietario']))
);

drop policy if exists patient_photo_update on public.patients;
create policy patient_photo_update on public.patients
for update to authenticated
using (
  organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'::uuid
  and private.has_permission(organization_id, 'patient_identity', 'edit')
)
with check (
  organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'::uuid
  and private.has_permission(organization_id, 'patient_identity', 'edit')
);

drop policy if exists profile_photo_write on storage.objects;
create policy profile_photo_write on storage.objects
for insert to authenticated
with check (
  bucket_id = 'profile-photos'
  and split_part(name, '/', 1) = 'a783bd4c-f253-4a94-9365-75c6f1000001'
  and (
    split_part(name, '/', 2) = auth.uid()::text
    or private.has_permission(split_part(name, '/', 1)::uuid, 'patient_identity', 'edit')
  )
);

drop policy if exists profile_photo_update on storage.objects;
create policy profile_photo_update on storage.objects
for update to authenticated
using (
  bucket_id = 'profile-photos'
  and split_part(name, '/', 1) = 'a783bd4c-f253-4a94-9365-75c6f1000001'
  and (
    split_part(name, '/', 2) = auth.uid()::text
    or private.has_permission(split_part(name, '/', 1)::uuid, 'patient_identity', 'edit')
  )
)
with check (
  bucket_id = 'profile-photos'
  and split_part(name, '/', 1) = 'a783bd4c-f253-4a94-9365-75c6f1000001'
  and (
    split_part(name, '/', 2) = auth.uid()::text
    or private.has_permission(split_part(name, '/', 1)::uuid, 'patient_identity', 'edit')
  )
);

drop policy if exists profile_photo_delete on storage.objects;
create policy profile_photo_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'profile-photos'
  and split_part(name, '/', 1) = 'a783bd4c-f253-4a94-9365-75c6f1000001'
  and (
    split_part(name, '/', 2) = auth.uid()::text
    or private.has_permission(split_part(name, '/', 1)::uuid, 'patient_identity', 'edit')
  )
);

commit;
