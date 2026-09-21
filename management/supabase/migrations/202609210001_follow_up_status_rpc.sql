begin;

create or replace function public.set_follow_up_status(
  p_follow_up_id uuid,
  p_status text,
  p_appointment_id uuid default null
) returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  follow_up_patient uuid;
begin
  if auth.uid() is null
    or not private.has_role('a783bd4c-f253-4a94-9365-75c6f1000001', array['proprietario','profissional','recepcao']) then
    raise exception 'not_authorized';
  end if;

  if p_status not in ('aguardando_agendamento','vencido','agendado','concluido') then
    raise exception 'invalid_follow_up_status';
  end if;

  select patient_id into follow_up_patient
  from public.follow_ups
  where id = p_follow_up_id
    and organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001';
  if follow_up_patient is null then
    raise exception 'follow_up_not_found';
  end if;

  if p_appointment_id is not null and not exists (
    select 1 from public.appointments
    where id = p_appointment_id
      and organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'
      and patient_id = follow_up_patient
  ) then
    raise exception 'appointment_patient_mismatch';
  end if;

  update public.follow_ups
  set status = p_status,
      appointment_id = coalesce(p_appointment_id, appointment_id),
      updated_at = now()
  where id = p_follow_up_id
    and organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001';

  update public.tasks
  set status = case when p_status in ('agendado','concluido') then 'concluida' else 'pendente' end
  where organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'
    and source_type = 'follow_up'
    and source_id = p_follow_up_id;
end;
$$;

revoke all on function public.set_follow_up_status(uuid,text,uuid) from public, anon;
grant execute on function public.set_follow_up_status(uuid,text,uuid) to authenticated;

commit;
