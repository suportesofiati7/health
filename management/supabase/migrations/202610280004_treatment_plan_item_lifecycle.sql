begin;

alter table public.treatment_plan_items add column archived_at timestamptz;

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
      if nullif(item_payload->>'id', '') is not null then
        update public.treatment_plan_items
        set procedure_id = item_procedure,
            sequence_no = sequence_value,
            sessions = sessions_value,
            area = coalesce(item_payload->>'area', ''),
            notes = coalesce(item_payload->>'notes', '')
        where id = (item_payload->>'id')::uuid
          and organization_id = organization_value
          and plan_id = plan_value
          and archived_at is null;
        if not found then
          raise exception using errcode = 'P0002', message = 'active_treatment_plan_item_not_found';
        end if;
      else
        insert into public.treatment_plan_items (
          organization_id, plan_id, procedure_id, sequence_no, sessions, area, notes, created_by
        ) values (
          organization_value, plan_value, item_procedure, sequence_value, sessions_value,
          coalesce(item_payload->>'area', ''), coalesce(item_payload->>'notes', ''), auth.uid()
        );
      end if;
    end if;
  end if;

  return plan_value;
end;
$function$;


revoke all on function public.save_treatment_plan(jsonb, jsonb) from public, anon;
grant execute on function public.save_treatment_plan(jsonb, jsonb) to authenticated;

create or replace function public.set_treatment_plan_item_archived(p_item uuid, p_archived boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare item_row record;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  select organization_id, plan_id into item_row
  from public.treatment_plan_items
  where id = p_item
  for update;
  if item_row.organization_id is null then
    raise exception using errcode = 'P0002', message = 'treatment_plan_item_not_found';
  end if;
  if not private.has_permission(item_row.organization_id, 'treatment_plans', 'edit') then
    raise exception using errcode = '42501', message = 'not_authorized';
  end if;
  update public.treatment_plan_items
  set archived_at = case when p_archived then now() else null end
  where id = p_item;
end;
$function$;
revoke all on function public.set_treatment_plan_item_archived(uuid, boolean) from public, anon;
grant execute on function public.set_treatment_plan_item_archived(uuid, boolean) to authenticated;

create or replace function public.schedule_treatment_plan(p_plan uuid, p_start_date date default current_date + 1, p_start_time time default '09:00')
returns integer
language plpgsql
security definer
set search_path = public, private
as $$
declare plan_row record; item_row record; procedure_row record; session_no integer; created_count integer := 0; recurrence_id uuid;
begin
  select * into plan_row from public.treatment_plans where id = p_plan;
  if plan_row.id is null or not private.has_role(plan_row.organization_id, array['proprietario','profissional']) then raise exception using errcode='42501', message='treatment_plan_access_denied'; end if;
  for item_row in select * from public.treatment_plan_items where organization_id = plan_row.organization_id and plan_id = plan_row.id and archived_at is null order by sequence_no loop
    select * into procedure_row from public.procedures where organization_id = plan_row.organization_id and id = item_row.procedure_id and active;
    if procedure_row.id is null then continue; end if;
    recurrence_id := gen_random_uuid();
    for session_no in 0..greatest(item_row.sessions,1)-1 loop
      insert into public.appointments(organization_id,patient_id,professional_id,procedure_id,procedure_snapshot,recurrence_group_id,recurrence_index,starts_at,ends_at,status,label,created_by)
      values(plan_row.organization_id,plan_row.patient_id,plan_row.responsible_user,procedure_row.id,to_jsonb(procedure_row),recurrence_id,session_no+1,
        (p_start_date + (session_no * coalesce(procedure_row.interval_days,procedure_row.followup_days,30))::integer)::timestamp + p_start_time,
        (p_start_date + (session_no * coalesce(procedure_row.interval_days,procedure_row.followup_days,30))::integer)::timestamp + p_start_time + make_interval(mins => procedure_row.default_duration),
        'agendado',procedure_row.name,auth.uid());
      created_count := created_count + 1;
    end loop;
  end loop;
  update public.treatment_plans set status='em_andamento', updated_at=now() where id=plan_row.id;
  return created_count;
end;
$$;
revoke all on function public.schedule_treatment_plan(uuid,date,time) from public, anon;
grant execute on function public.schedule_treatment_plan(uuid,date,time) to authenticated;

commit;
