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
  usages jsonb;
  item jsonb;
  materials jsonb := '[]'::jsonb;
  product_record public.products%rowtype;
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

  -- Accept the original single-lot payload as well as multiple manual/catalogue entries.
  usages := case when usage_payload is null then '[]'::jsonb
    when jsonb_typeof(usage_payload) = 'object' then jsonb_build_array(usage_payload)
    else usage_payload end;
  if jsonb_typeof(usages) is distinct from 'array' then
    raise exception using errcode = '22023', message = 'invalid_usage_payload';
  end if;
  for item in select value from jsonb_array_elements(usages) loop
    if jsonb_typeof(item) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'invalid_usage_payload';
    end if;
    lot_value := nullif(item->>'lot_id', '')::uuid;
    quantity_value := nullif(item->>'quantity', '')::numeric;
    if quantity_value is not null and (quantity_value <= 0 or quantity_value::text in ('NaN', 'Infinity', '-Infinity')) then
      raise exception using errcode = '22023', message = 'inventory_quantity_must_be_positive';
    end if;
    if lot_value is not null then
      select lot.* into lot_record from public.product_lots lot
      where lot.organization_id = organization_value and lot.id = lot_value and lot.active for update;
      if not found then
        raise exception using errcode = '23503', message = 'inventory_lot_not_found_or_inactive';
      end if;
      select p.* into product_record from public.products p
      where p.organization_id = organization_value and p.id = lot_record.product_id;
      -- A linked stock lot always retains its actual identity. Overrides are manual entries.
      item := item || jsonb_build_object('product_id', product_record.id, 'name', product_record.name,
        'manufacturer', product_record.manufacturer, 'lot', lot_record.lot, 'expires_on', lot_record.expires_on);
    elsif nullif(btrim(item->>'name'), '') is null then
      raise exception using errcode = '22023', message = 'product_name_required';
    end if;
    if nullif(item->>'expires_on', '')::date < (now() at time zone 'America/Sao_Paulo')::date then
      raise exception using errcode = '22023', message = 'inventory_lot_expired';
    end if;
    materials := materials || jsonb_build_array(item);
  end loop;
  if exists (select 1 from public.procedures p where p.id = procedure_value
      and p.organization_id = organization_value and p.lot_required)
    and not exists (select 1 from jsonb_array_elements(materials) m where nullif(btrim(m->>'lot'), '') is not null) then
    raise exception using errcode = '22023', message = 'treatment_lot_required';
  end if;
  procedure_payload := jsonb_set(procedure_payload, '{parameters}',
    coalesce(procedure_payload->'parameters', '{}'::jsonb) || jsonb_build_object('materials', materials));

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

  for item in select value from jsonb_array_elements(materials) loop
    lot_value := nullif(item->>'lot_id', '')::uuid;
    if lot_value is not null then
      insert into public.product_usages (
        organization_id, clinical_procedure_id, lot_id, quantity, unit, created_by
      ) values (
        organization_value, procedure_record, lot_value, nullif(item->>'quantity', '')::numeric,
        coalesce(item->>'unit', ''), auth.uid()
      );
    end if;
  end loop;

  update public.clinical_procedures
  set status = 'finalizado', finalized_at = now()
  where id = procedure_record and organization_id = organization_value and status = 'rascunho';

  return procedure_record;
end;
$function$;

revoke all on function public.record_clinical_procedure(jsonb, jsonb) from public, anon;
grant execute on function public.record_clinical_procedure(jsonb, jsonb) to authenticated;

create or replace function private.enforce_procedure_safety() returns trigger
language plpgsql security definer set search_path='' as $$
declare catalogue public.procedures%rowtype; evidence public.consents%rowtype;
begin
  if new.status='finalizado' and (tg_op='INSERT' or old.status is distinct from 'finalizado') then
    if auth.uid() is not null and not private.has_permission(new.organization_id,'procedures','finalize') then
      raise exception using errcode='42501',message='procedure_finalize_denied';
    end if;
    if new.history_only then return new; end if;
    select * into catalogue from public.procedures where organization_id=new.organization_id and id=new.procedure_id;
    if catalogue.required_consents ? 'procedimento' then
      if new.consent_status<>'aceito' then raise exception using errcode='23514',message='procedure_consent_required'; end if;
      select * into evidence from public.consents c
        where c.organization_id=new.organization_id and c.patient_id=new.patient_id and c.procedure_id=new.procedure_id
          and c.kind='procedimento' and (c.clinical_procedure_id=new.id or c.clinical_procedure_id is null)
        order by c.created_at desc,c.id desc limit 1;
      if evidence.id is null or evidence.status<>'aceito' or evidence.accepted_at is null
        or (coalesce(catalogue.consent_template_version,'')<>'' and evidence.template_version<>catalogue.consent_template_version) then
        raise exception using errcode='23514',message='procedure_consent_evidence_required';
      end if;
    end if;
    if catalogue.lot_required and not exists(select 1 from public.product_usages u
      where u.organization_id=new.organization_id and u.clinical_procedure_id=new.id)
      and not exists(select 1 from jsonb_array_elements(coalesce(new.parameters->'materials','[]'::jsonb)) m
        where nullif(btrim(m->>'name'),'') is not null and nullif(btrim(m->>'lot'),'') is not null) then
      raise exception using errcode='23514',message='procedure_lot_required';
    end if;
  end if;
  return new;
end $$;


commit;
