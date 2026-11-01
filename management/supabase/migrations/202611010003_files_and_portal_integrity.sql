begin;
-- Replacement keeps the old bytes and immutable metadata, so a change cannot
-- erase the photographic evidence previously associated with a procedure.
create table public.clinical_photo_versions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null,
  patient_id uuid not null, photo_id uuid not null references public.clinical_photos(id) on delete cascade,
  snapshot jsonb not null, created_by uuid references auth.users(id), created_at timestamptz not null default now(),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id)
);
alter table public.clinical_photo_versions enable row level security;
revoke all on public.clinical_photo_versions from anon,authenticated;
grant select on public.clinical_photo_versions to authenticated;
create policy photo_versions_read on public.clinical_photo_versions for select to authenticated using(private.has_permission(organization_id,'photos','view'));
create function private.keep_photo_version() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.clinical_photo_versions(organization_id,patient_id,photo_id,snapshot,created_by)
    values(old.organization_id,old.patient_id,old.id,to_jsonb(old),auth.uid());
  return new;
end $$;
create trigger keep_photo_version before update on public.clinical_photos for each row execute function private.keep_photo_version();

-- Storage cannot participate in a PostgreSQL transaction. Record a durable
-- cleanup job atomically with metadata deletion; an interrupted HTTP request
-- can safely retry without forgetting private bytes.
create table public.pending_storage_deletions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null,
  resource_id uuid not null, patient_id uuid not null, bucket text not null, path text not null,
  created_at timestamptz not null default now(), unique(bucket,path)
);
alter table public.pending_storage_deletions enable row level security;
revoke all on public.pending_storage_deletions from anon,authenticated;
create function public.delete_clinical_photo(photo_id uuid, patient uuid) returns setof public.pending_storage_deletions
language plpgsql security definer set search_path='' as $$
declare photo public.clinical_photos%rowtype; org uuid := 'a783bd4c-f253-4a94-9365-75c6f1000001';
begin
  if not private.has_permission(org,'photos','delete') then raise exception using errcode='42501',message='not_authorized'; end if;
  select * into photo from public.clinical_photos p where p.id=photo_id and p.patient_id=patient and p.organization_id=org for update;
  if found then
    insert into public.pending_storage_deletions(organization_id,resource_id,patient_id,bucket,path)
      values(org,photo.id,patient,'clinical-photos',photo.path) on conflict do nothing;
    insert into public.pending_storage_deletions(organization_id,resource_id,patient_id,bucket,path)
      select org,photo.id,patient,'clinical-photos',v.snapshot->>'path' from public.clinical_photo_versions v where v.photo_id=photo.id on conflict do nothing;
    delete from public.clinical_photos p where p.id=photo.id;
    insert into public.audit_events(organization_id,actor_id,action,entity_type,entity_id) values(org,auth.uid(),'delete','clinical_photos',photo.id);
  end if;
  return query select j.* from public.pending_storage_deletions j where j.resource_id=photo_id and j.patient_id=patient and j.organization_id=org;
end $$;
revoke all on function public.delete_clinical_photo(uuid,uuid) from public,anon;
grant execute on function public.delete_clinical_photo(uuid,uuid) to authenticated;

-- A portal request is not completed until its concrete scheduling effect has
-- committed. Rebooking/symptom requests remain staff-reviewed workflows.
create function private.resolve_portal_action() returns trigger language plpgsql security definer set search_path='' as $$
declare appointment_status text;
begin
  if new.status in ('concluida','recusada') and old.status is distinct from new.status then
    new.resolved_by:=auth.uid(); new.resolved_at:=now();
    if new.status='concluida' and new.action_type in ('confirmar_agendamento','cancelar_agendamento') then
      if not private.has_permission(new.organization_id,'appointments','edit') then raise exception using errcode='42501',message='not_authorized'; end if;
      select a.status into appointment_status from public.appointments a where a.organization_id=new.organization_id and a.patient_id=new.patient_id and a.id=new.appointment_id for update;
      if appointment_status is null or appointment_status in ('concluido','cancelado','faltou','reagendado') then raise exception 'portal_appointment_not_actionable'; end if;
      update public.appointments set status=case new.action_type when 'confirmar_agendamento' then 'confirmado' else 'cancelado' end where id=new.appointment_id and organization_id=new.organization_id;
    end if;
  end if;
  return new;
end $$;
create trigger resolve_portal_action before update on public.patient_portal_actions for each row execute function private.resolve_portal_action();
commit;
