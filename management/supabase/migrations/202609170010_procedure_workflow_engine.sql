begin;

-- Make the catalogue usable as the source of defaults throughout the care journey.
alter table public.procedures
  add column if not exists booking_buffer_minutes integer not null default 0 check(booking_buffer_minutes between 0 and 240),
  add column if not exists room_requirement text not null default '',
  add column if not exists eligible_roles jsonb not null default '[]' check(jsonb_typeof(eligible_roles)='array'),
  add column if not exists questionnaire jsonb not null default '[]' check(jsonb_typeof(questionnaire)='array'),
  add column if not exists required_consents jsonb not null default '[]' check(jsonb_typeof(required_consents)='array'),
  add column if not exists public_description text not null default '',
  add column if not exists review_status text not null default 'aprovacao_pendente' check(review_status in ('rascunho','aprovacao_pendente','aprovado','arquivado')),
  add column if not exists reviewed_by uuid references auth.users(id),
  add column if not exists reviewed_at timestamptz,
  add column if not exists next_review_on date;

alter table public.appointments
  add column if not exists procedure_id uuid,
  add column if not exists procedure_snapshot jsonb not null default '{}' check(jsonb_typeof(procedure_snapshot)='object');
alter table public.appointments
  add constraint appointments_procedure_fk foreign key (organization_id, procedure_id)
  references public.procedures(organization_id, id) not valid;

alter table public.consents
  add column if not exists procedure_id uuid,
  add column if not exists procedure_snapshot jsonb not null default '{}' check(jsonb_typeof(procedure_snapshot)='object');
alter table public.consents
  add constraint consents_procedure_fk foreign key (organization_id, procedure_id)
  references public.procedures(organization_id, id) not valid;

-- Sensible defaults for existing entries; clinic-specific values remain editable.
update public.procedures
set public_description = description,
    review_status = case when ai_generated then 'aprovacao_pendente' else review_status end,
    required_consents = case when category = 'injetavel' or device_relevant then '["procedimento","fotografia_clinica"]'::jsonb else '["procedimento"]'::jsonb end,
    questionnaire = '[{"key":"health_changes","label":"Houve alguma alteração de saúde, medicamento, alergia, gestação/amamentação ou infecção desde a última avaliação?","required":true},{"key":"expectations","label":"Qual é o objetivo principal para este atendimento?","required":true}]'::jsonb
where public_description = '' or jsonb_array_length(required_consents) = 0 or jsonb_array_length(questionnaire) = 0;

create index if not exists appointments_procedure_idx on public.appointments(organization_id, procedure_id);
create index if not exists consents_procedure_idx on public.consents(organization_id, procedure_id);

-- Finalizing a clinical procedure creates one follow-up task from the catalogue
-- interval. The trigger is idempotent and keeps the patient journey automatic.
create or replace function private.create_procedure_follow_up()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare days_after integer;
begin
  if new.status <> 'finalizado' or (tg_op = 'UPDATE' and old.status = 'finalizado') then
    return new;
  end if;
  select followup_days into days_after from public.procedures
  where organization_id = new.organization_id and id = new.procedure_id;
  if coalesce(days_after, 0) > 0 then
    insert into public.follow_ups(organization_id, patient_id, clinical_procedure_id, expected_on, professional_id, notes, created_by)
    values(new.organization_id, new.patient_id, new.id, current_date + days_after, new.professional_id, 'Retorno automático conforme catálogo: ' || coalesce((select follow_up from public.procedures where organization_id = new.organization_id and id = new.procedure_id), ''), coalesce(new.created_by, auth.uid()))
    on conflict do nothing;
  end if;
  return new;
end;
$$;
drop trigger if exists clinical_procedure_follow_up on public.clinical_procedures;
create trigger clinical_procedure_follow_up
after insert or update of status on public.clinical_procedures
for each row execute function private.create_procedure_follow_up();

commit;
