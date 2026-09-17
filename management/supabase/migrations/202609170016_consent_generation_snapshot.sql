begin;

alter table public.consents
  add column if not exists patient_answers jsonb not null default '{}'
    check (jsonb_typeof(patient_answers) = 'object');

create or replace function private.generate_consent_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare catalogue jsonb;
begin
  catalogue := new.procedure_snapshot;
  if new.procedure_id is not null and (catalogue is null or catalogue = '{}'::jsonb) then
    select to_jsonb(p) into catalogue
    from public.procedures p
    where p.organization_id = new.organization_id and p.id = new.procedure_id;
  end if;
  new.procedure_snapshot := coalesce(catalogue, '{}'::jsonb);
  new.generated_content := jsonb_build_object(
    'generated_at', now(),
    'procedure_id', new.procedure_id,
    'catalog_version', coalesce(new.procedure_snapshot->>'catalog_version', '1'),
    'patient_answers', coalesce(new.patient_answers, '{}'::jsonb),
    'sections', jsonb_build_object(
      'description', coalesce(new.procedure_snapshot->>'description', ''),
      'purpose', coalesce(new.procedure_snapshot->>'purpose', ''),
      'indications', coalesce(new.procedure_snapshot->>'indications', ''),
      'areas', coalesce(new.procedure_snapshot->>'areas', ''),
      'benefits', coalesce(new.procedure_snapshot->>'benefits', ''),
      'recovery', coalesce(new.procedure_snapshot->>'recovery', ''),
      'before_after_care', coalesce(new.procedure_snapshot->>'before_after_care', ''),
      'clinical_details', coalesce(new.procedure_snapshot->'clinical_details', '{}'::jsonb),
      'consent_template', coalesce(new.procedure_snapshot->>'consent_template', '')
    )
  );
  return new;
end;
$$;

drop trigger if exists consent_generation_snapshot on public.consents;
create trigger consent_generation_snapshot
before insert or update of procedure_id, procedure_snapshot, patient_answers
on public.consents
for each row execute function private.generate_consent_snapshot();

commit;
