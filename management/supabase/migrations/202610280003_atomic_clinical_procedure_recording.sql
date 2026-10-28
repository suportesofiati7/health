begin;

-- Keep a finalized clinical procedure, its product usage, and the resulting
-- inventory movement in one transaction. A failed lot/stock write must not
-- leave an apparently completed clinical record behind.
create or replace function public.record_clinical_procedure(
  procedure_payload jsonb,
  usage_payload jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  organization_value uuid;
  patient_value uuid;
  procedure_value uuid;
  professional_value uuid;
  lot_value uuid;
  procedure_record uuid;
  lot_record public.product_lots%rowtype;
  quantity_value numeric;
  consent_value text;
  draft_value uuid;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if jsonb_typeof(procedure_payload) is distinct from 'object' then
    raise exception using errcode = '22023', message = 'invalid_procedure_payload';
  end if;

  organization_value := nullif(procedure_payload->>'organization_id', '')::uuid;
  patient_value := nullif(procedure_payload->>'patient_id', '')::uuid;
  procedure_value := nullif(procedure_payload->>'procedure_id', '')::uuid;
  professional_value := nullif(procedure_payload->>'professional_id', '')::uuid;
  draft_value := nullif(procedure_payload->>'id', '')::uuid;
  consent_value := coalesce(procedure_payload->>'consent_status', 'pendente');

  if organization_value is null or patient_value is null or procedure_value is null or professional_value is null then
    raise exception using errcode = '22023', message = 'required_procedure_fields_missing';
  end if;
  if draft_value is null then
    if not private.has_permission(organization_value, 'procedures', 'create') then
      raise exception using errcode = '42501', message = 'not_authorized';
    end if;
  elsif not private.has_permission(organization_value, 'procedures', 'edit') then
    raise exception using errcode = '42501', message = 'not_authorized';
  end if;
  if consent_value not in ('pendente', 'aceito', 'recusado', 'nao_aplicavel') then
    raise exception using errcode = '22023', message = 'invalid_consent_status';
  end if;
  if jsonb_typeof(coalesce(procedure_payload->'parameters', '{}'::jsonb)) is distinct from 'object' then
    raise exception using errcode = '22023', message = 'invalid_device_parameters';
  end if;

  if usage_payload is not null then
    if jsonb_typeof(usage_payload) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'invalid_usage_payload';
    end if;
    lot_value := nullif(usage_payload->>'lot_id', '')::uuid;
    quantity_value := nullif(usage_payload->>'quantity', '')::numeric;
    if lot_value is null then
      raise exception using errcode = '22023', message = 'inventory_lot_required';
    end if;
    if quantity_value is not null and quantity_value <= 0 then
      raise exception using errcode = '22023', message = 'inventory_quantity_must_be_positive';
    end if;

    select lot.* into lot_record
    from public.product_lots lot
    where lot.organization_id = organization_value
      and lot.id = lot_value
      and lot.active
    for update;
    if not found then
      raise exception using errcode = '23503', message = 'inventory_lot_not_found_or_inactive';
    end if;
    if lot_record.expires_on is not null
      and lot_record.expires_on < (now() at time zone 'America/Sao_Paulo')::date then
      raise exception using errcode = '22023', message = 'inventory_lot_expired';
    end if;
  end if;

  if draft_value is null then
    insert into public.clinical_procedures (
      organization_id, patient_id, procedure_id, professional_id,
      appointment_id, plan_id, performed_at, area, treatment_area,
      indication, technique, parameters, post_care, consent_status,
      device_id, status, finalized_at, created_by
    ) values (
      organization_value,
      patient_value,
      procedure_value,
      professional_value,
      nullif(procedure_payload->>'appointment_id', '')::uuid,
      nullif(procedure_payload->>'plan_id', '')::uuid,
      coalesce(nullif(procedure_payload->>'performed_at', '')::timestamptz, now()),
      coalesce(procedure_payload->>'area', ''),
      coalesce(procedure_payload->>'treatment_area', procedure_payload->>'area', ''),
      coalesce(procedure_payload->>'indication', ''),
      coalesce(procedure_payload->>'technique', ''),
      coalesce(procedure_payload->'parameters', '{}'::jsonb),
      coalesce(procedure_payload->>'post_care', ''),
      consent_value,
      nullif(procedure_payload->>'device_id', '')::uuid,
      'rascunho', null, auth.uid()
    ) returning id into procedure_record;
  else
    update public.clinical_procedures
    set patient_id = patient_value,
        procedure_id = procedure_value,
        professional_id = professional_value,
        appointment_id = nullif(procedure_payload->>'appointment_id', '')::uuid,
        plan_id = nullif(procedure_payload->>'plan_id', '')::uuid,
        performed_at = coalesce(nullif(procedure_payload->>'performed_at', '')::timestamptz, now()),
        area = coalesce(procedure_payload->>'area', ''),
        treatment_area = coalesce(procedure_payload->>'treatment_area', procedure_payload->>'area', ''),
        indication = coalesce(procedure_payload->>'indication', ''),
        technique = coalesce(procedure_payload->>'technique', ''),
        parameters = coalesce(procedure_payload->'parameters', '{}'::jsonb),
        post_care = coalesce(procedure_payload->>'post_care', ''),
        consent_status = consent_value,
        device_id = nullif(procedure_payload->>'device_id', '')::uuid
    where id = draft_value
      and organization_id = organization_value
      and status = 'rascunho'
    returning id into procedure_record;
    if procedure_record is null then
      raise exception using errcode = 'P0002', message = 'clinical_draft_not_found_or_finalized';
    end if;
  end if;

  if usage_payload is not null then
    insert into public.product_usages (
      organization_id, clinical_procedure_id, lot_id, quantity, unit, created_by
    ) values (
      organization_value, procedure_record, lot_value, quantity_value,
      coalesce(usage_payload->>'unit', ''), auth.uid()
    );
  end if;

  update public.clinical_procedures
  set status = 'finalizado', finalized_at = now()
  where id = procedure_record and organization_id = organization_value and status = 'rascunho';

  return procedure_record;
end;
$function$;

revoke all on function public.record_clinical_procedure(jsonb, jsonb) from public, anon;
grant execute on function public.record_clinical_procedure(jsonb, jsonb) to authenticated;

-- A plan and its optional first/additional item are one user action. Commit
-- both together so retries after a partial failure cannot create duplicates.
create or replace function public.save_treatment_plan(
  plan_payload jsonb,
  item_payload jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  organization_value uuid;
  patient_value uuid;
  plan_value uuid;
  existing_plan uuid;
  permission_action text;
  item_procedure uuid;
  sequence_value integer;
  sessions_value integer;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if jsonb_typeof(plan_payload) is distinct from 'object' then
    raise exception using errcode = '22023', message = 'invalid_treatment_plan_payload';
  end if;

  organization_value := nullif(plan_payload->>'organization_id', '')::uuid;
  patient_value := nullif(plan_payload->>'patient_id', '')::uuid;
  existing_plan := nullif(plan_payload->>'id', '')::uuid;
  if organization_value is null or patient_value is null then
    raise exception using errcode = '22023', message = 'required_treatment_plan_fields_missing';
  end if;

  permission_action := case when existing_plan is null then 'create' else 'edit' end;
  if not private.has_permission(organization_value, 'treatment_plans', permission_action) then
    raise exception using errcode = '42501', message = 'not_authorized';
  end if;

  if existing_plan is null then
    insert into public.treatment_plans (
      organization_id, patient_id, title, objectives, areas,
      professional_notes, responsible_user, expected_followup, status, created_by
    ) values (
      organization_value,
      patient_value,
      coalesce(nullif(plan_payload->>'title', ''), 'Plano de tratamento'),
      coalesce(plan_payload->>'objectives', ''),
      coalesce(plan_payload->>'areas', ''),
      coalesce(plan_payload->>'professional_notes', ''),
      nullif(plan_payload->>'responsible_user', '')::uuid,
      nullif(plan_payload->>'expected_followup', '')::date,
      coalesce(nullif(plan_payload->>'status', ''), 'planejado'),
      auth.uid()
    ) returning id into plan_value;
  else
    update public.treatment_plans
    set title = coalesce(nullif(plan_payload->>'title', ''), 'Plano de tratamento'),
        objectives = coalesce(plan_payload->>'objectives', ''),
        areas = coalesce(plan_payload->>'areas', ''),
        professional_notes = coalesce(plan_payload->>'professional_notes', ''),
        responsible_user = nullif(plan_payload->>'responsible_user', '')::uuid,
        expected_followup = nullif(plan_payload->>'expected_followup', '')::date,
        status = coalesce(nullif(plan_payload->>'status', ''), 'planejado')
    where id = existing_plan and organization_id = organization_value and patient_id = patient_value
    returning id into plan_value;
    if plan_value is null then
      raise exception using errcode = 'P0002', message = 'treatment_plan_not_found';
    end if;
  end if;

  if item_payload is not null then
    if jsonb_typeof(item_payload) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'invalid_treatment_plan_item_payload';
    end if;
    item_procedure := nullif(item_payload->>'procedure_id', '')::uuid;
    if item_procedure is not null then
      sequence_value := coalesce(nullif(item_payload->>'sequence_no', '')::integer, 1);
      sessions_value := coalesce(nullif(item_payload->>'sessions', '')::integer, 1);
      if sequence_value < 1 or sessions_value < 1 or sessions_value > 100 then
        raise exception using errcode = '22023', message = 'invalid_treatment_plan_item_values';
      end if;
      insert into public.treatment_plan_items (
        organization_id, plan_id, procedure_id, sequence_no, sessions, area, notes, created_by
      ) values (
        organization_value, plan_value, item_procedure, sequence_value, sessions_value,
        coalesce(item_payload->>'area', ''), coalesce(item_payload->>'notes', ''), auth.uid()
      );
    end if;
  end if;

  return plan_value;
end;
$function$;

revoke all on function public.save_treatment_plan(jsonb, jsonb) from public, anon;
grant execute on function public.save_treatment_plan(jsonb, jsonb) to authenticated;

commit;
