begin;

-- Identity photos use the existing private-storage model. Paths are stored in
-- the records so signed URLs can be issued only to authenticated staff.
alter table public.memberships add column if not exists avatar_path text;
alter table public.patients add column if not exists avatar_path text;

alter table public.staff_permissions add column if not exists can_delete boolean not null default false;
alter table public.staff_permissions add column if not exists can_manage boolean not null default false;
alter table public.staff_permissions add column if not exists can_administer boolean not null default false;
grant update(avatar_path) on public.memberships to authenticated;

create or replace function private.has_permission(org uuid, permission_area text, permission_action text)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_role(org, array['proprietario']) or exists (
    select 1 from public.memberships m join public.staff_permissions p
      on p.organization_id=m.organization_id and p.user_id=m.user_id
    where m.organization_id=org and m.user_id=auth.uid() and m.status='ativo' and p.area=permission_area
      and case permission_action
        when 'view' then p.can_view when 'create' then p.can_create when 'edit' then p.can_edit
        when 'finalize' then p.can_finalize when 'export' then p.can_export when 'share' then p.can_share
        when 'delete' then p.can_delete when 'manage' then p.can_manage when 'administer' then p.can_administer
        else false end
  );
$$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('profile-photos','profile-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;

create policy profile_photo_read on storage.objects for select to authenticated
using(bucket_id='profile-photos' and exists (
  select 1 from public.memberships m
  where m.organization_id = split_part(storage.objects.name,'/',1)::uuid
    and m.status='ativo'
    and private.has_role(m.organization_id,array['proprietario','profissional','recepcao','leitura'])
));
create policy profile_photo_write on storage.objects for insert to authenticated
with check(bucket_id='profile-photos' and (split_part(name,'/',2)=auth.uid()::text or private.has_role(split_part(name,'/',1)::uuid,array['proprietario'])));
create policy profile_photo_update on storage.objects for update to authenticated
using(bucket_id='profile-photos' and (split_part(name,'/',2)=auth.uid()::text or private.has_role(split_part(name,'/',1)::uuid,array['proprietario'])))
with check(bucket_id='profile-photos' and (split_part(name,'/',2)=auth.uid()::text or private.has_role(split_part(name,'/',1)::uuid,array['proprietario'])));
create policy profile_photo_delete on storage.objects for delete to authenticated
using(bucket_id='profile-photos' and (split_part(name,'/',2)=auth.uid()::text or private.has_role(split_part(name,'/',1)::uuid,array['proprietario'])));

create policy membership_photo_update on public.memberships for update to authenticated
using(user_id=auth.uid() or private.has_role(organization_id,array['proprietario']))
with check(user_id=auth.uid() or private.has_role(organization_id,array['proprietario']));
create policy patient_photo_update on public.patients for update to authenticated
using(private.has_permission(organization_id,'patient_identity','edit'))
with check(private.has_permission(organization_id,'patient_identity','edit'));

create or replace function public.authorize_full_backup() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.memberships m where m.organization_id='a783bd4c-f253-4a94-9365-75c6f1000001'::uuid
    and m.user_id=auth.uid() and m.status='ativo' and lower(m.email)='suportesofiati@gmail.com');
$$;
revoke all on function public.authorize_full_backup() from public, anon;
grant execute on function public.authorize_full_backup() to authenticated;

commit;
