begin;

-- Repair production schema drift: the original migration was recorded but
-- this RPC was absent, causing save_appointment_series to roll back returns.
create or replace function public.set_follow_up_status(
  p_follow_up_id uuid,
  p_status text,
  p_appointment_id uuid default null
) returns void language plpgsql security definer set search_path = '' as $$
declare
  follow_up_row public.follow_ups%rowtype;
begin
  select * into follow_up_row from public.follow_ups where id=p_follow_up_id for update;
  if follow_up_row.id is null then raise exception 'follow_up_not_found'; end if;
  if not private.has_permission(follow_up_row.organization_id,'appointments','edit') then
    raise exception using errcode='42501',message='not_authorized';
  end if;
  if p_status is null or p_status not in ('aguardando_agendamento','vencido','agendado','concluido') then
    raise exception using errcode='22023',message='invalid_follow_up_status';
  end if;
  if p_appointment_id is not null and not exists (
    select 1 from public.appointments where id=p_appointment_id
      and organization_id=follow_up_row.organization_id and patient_id=follow_up_row.patient_id
  ) then raise exception 'appointment_patient_mismatch'; end if;

  update public.follow_ups set status=p_status,
    appointment_id=coalesce(p_appointment_id,appointment_id),updated_at=now()
    where id=p_follow_up_id;
  update public.tasks
    set status=case when p_status in ('agendado','concluido') then 'concluida' else 'pendente' end
    where organization_id=follow_up_row.organization_id
      and source_type='follow_up' and source_id=p_follow_up_id;
end $$;
revoke all on function public.set_follow_up_status(uuid,text,uuid) from public,anon;
grant execute on function public.set_follow_up_status(uuid,text,uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
