begin;
-- The existing consent_update RLS policy was unusable without its SQL grant.
grant update on public.consents to authenticated;
-- The metadata-edit policy existed but its SQL UPDATE grant was missing,
-- leaving clinical-photo replacement impossible for every non-service user.
grant update on public.clinical_photos to authenticated;
create policy clinical_photo_version_read on storage.objects for select to authenticated using(
  bucket_id='clinical-photos' and exists(select 1 from public.clinical_photo_versions v
    where v.snapshot->>'path'=storage.objects.name and private.has_permission(v.organization_id,'photos','view'))
);

-- A parent cannot be reassigned underneath already-linked clinical evidence.
create function private.patient_parent_guard() returns trigger
language plpgsql security definer set search_path='' as $$
declare conflict_found boolean; i integer;
begin
  if new.patient_id is not distinct from old.patient_id and new.organization_id=old.organization_id then return new; end if;
  for i in 0..tg_nargs/2-1 loop
    execute format('select exists(select 1 from public.%I where organization_id=$1 and %I=$2 and patient_id is distinct from $3)',tg_argv[i*2],tg_argv[i*2+1])
      into conflict_found using old.organization_id,old.id,new.patient_id;
    if conflict_found then raise exception using errcode='23514',message='patient_relationship_mismatch'; end if;
  end loop;
  return new;
end $$;
create trigger patient_parent_guard before update on public.appointments for each row execute function private.patient_parent_guard('clinical_procedures','appointment_id','follow_ups','appointment_id','patient_portal_actions','appointment_id','communications','appointment_id');
create trigger patient_parent_guard before update on public.treatment_plans for each row execute function private.patient_parent_guard('clinical_procedures','plan_id');
create trigger patient_parent_guard before update on public.clinical_procedures for each row execute function private.patient_parent_guard('clinical_photos','clinical_procedure_id','consents','clinical_procedure_id','follow_ups','clinical_procedure_id','adverse_events','clinical_procedure_id','patient_portal_actions','clinical_procedure_id');
create trigger patient_relationship_guard before insert or update on public.communications for each row execute function private.patient_relationship_guard('appointment_id','appointments');

-- Capture previous consent evidence, including revocations, without replacing
-- the original catalogue snapshot or copying sensitive content into audit logs.
create table public.consent_versions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, patient_id uuid not null,
  consent_id uuid not null references public.consents(id) on delete cascade,
  snapshot jsonb not null, created_by uuid references auth.users(id), created_at timestamptz not null default now(),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id)
);
alter table public.consent_versions enable row level security;
revoke all on public.consent_versions from anon,authenticated;
grant select on public.consent_versions to authenticated;
create policy consent_versions_read on public.consent_versions for select to authenticated using(private.has_permission(organization_id,'consents','view'));
create function private.keep_consent_version() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.organization_id<>old.organization_id or new.patient_id<>old.patient_id then raise exception 'immutable_consent_identity'; end if;
  insert into public.consent_versions(organization_id,patient_id,consent_id,snapshot,created_by)
    values(old.organization_id,old.patient_id,old.id,to_jsonb(old),auth.uid());
  return new;
end $$;
create trigger keep_consent_version before update on public.consents for each row execute function private.keep_consent_version();
commit;
