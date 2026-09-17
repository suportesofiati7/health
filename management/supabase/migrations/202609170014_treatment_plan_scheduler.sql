begin;

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
  for item_row in select * from public.treatment_plan_items where organization_id = plan_row.organization_id and plan_id = plan_row.id order by sequence_no loop
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
