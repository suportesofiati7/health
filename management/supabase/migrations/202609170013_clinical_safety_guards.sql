begin;

create or replace function private.enforce_procedure_safety()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare requires_consent boolean;
begin
  if new.status = 'finalizado' then
    select coalesce(required_consents ? 'procedimento', false) into requires_consent
    from public.procedures where organization_id = new.organization_id and id = new.procedure_id;
    if coalesce(requires_consent, false) and new.consent_status <> 'aceito' then
      raise exception using errcode = 'check_violation', message = 'procedure_consent_required';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists clinical_procedure_safety_guard on public.clinical_procedures;
create trigger clinical_procedure_safety_guard
before insert or update of status, consent_status, procedure_id on public.clinical_procedures
for each row execute function private.enforce_procedure_safety();

commit;
