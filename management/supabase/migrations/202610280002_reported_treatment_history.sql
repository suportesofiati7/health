begin;

-- Imported/reported history must not invent an appointment date or performing
-- professional. Ordinary treatment records retain both requirements.
alter table public.clinical_procedures
  add column history_only boolean not null default false,
  alter column performed_at drop not null,
  alter column professional_id drop not null;
alter table public.clinical_procedures add constraint clinical_procedure_event_identity
  check(history_only or (performed_at is not null and professional_id is not null));

create or replace function private.create_procedure_follow_up()
returns trigger language plpgsql security definer set search_path='' as $$
declare days_after integer;
begin
  if new.history_only or new.status <> 'finalizado' or (tg_op='UPDATE' and old.status='finalizado') then return new; end if;
  select followup_days into days_after from public.procedures
    where organization_id=new.organization_id and id=new.procedure_id;
  if coalesce(days_after,0)>0 then
    insert into public.follow_ups(organization_id,patient_id,clinical_procedure_id,expected_on,professional_id,notes,created_by)
      values(new.organization_id,new.patient_id,new.id,(new.performed_at at time zone 'America/Sao_Paulo')::date+days_after,new.professional_id,
        'Retorno automático conforme catálogo: '||coalesce((select follow_up from public.procedures where organization_id=new.organization_id and id=new.procedure_id),''),coalesce(new.created_by,auth.uid()));
  end if;
  return new;
end $$;

commit;
