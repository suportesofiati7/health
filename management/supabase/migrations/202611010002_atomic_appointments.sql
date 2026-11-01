begin;
alter table public.appointments add column booking_request_id uuid;
create unique index appointments_booking_request_unique on public.appointments(organization_id,booking_request_id,recurrence_index) where booking_request_id is not null;

-- One booking gesture, including recurrence and follow-up linkage, is one
-- database transaction. Retrying a completed request returns its original row.
create function public.save_appointment_series(payload jsonb, session_count integer default 1, interval_days integer default 0, follow_up_id uuid default null, request_id uuid default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare
  org uuid := nullif(payload->>'organization_id','')::uuid;
  patient uuid := nullif(payload->>'patient_id','')::uuid;
  existing_id uuid := nullif(payload->>'id','')::uuid;
  first_id uuid; inserted_id uuid; i integer; expected integer;
  group_id uuid := case when session_count>1 then gen_random_uuid() else null end;
  starts timestamptz := (payload->>'starts_at')::timestamptz;
  ends timestamptz := (payload->>'ends_at')::timestamptz;
begin
  if not private.has_permission(org,'appointments',case when existing_id is null then 'create' else 'edit' end) then
    raise exception using errcode='42501',message='not_authorized';
  end if;
  if session_count not between 1 and 100 or interval_days<0 or interval_days>3650 or (session_count>1 and interval_days=0) or ends<=starts then
    raise exception using errcode='22023',message='invalid_appointment_series';
  end if;
  if existing_id is not null and session_count<>1 then raise exception 'cannot_repeat_existing_appointment'; end if;
  if follow_up_id is not null then
    perform 1 from public.follow_ups f where f.organization_id=org and f.id=follow_up_id and f.patient_id=patient for update;
    if not found then raise exception 'appointment_patient_mismatch'; end if;
  end if;
  if request_id is not null and existing_id is null then
    perform pg_advisory_xact_lock(hashtextextended(org::text||request_id::text,0));
    select id into first_id from public.appointments where organization_id=org and booking_request_id=request_id order by recurrence_index limit 1;
    if first_id is not null then
      if not exists(select 1 from public.appointments where id=first_id and patient_id=patient) then raise exception 'appointment_patient_mismatch'; end if;
      return first_id;
    end if;
  end if;
  if existing_id is not null then
    expected := nullif(payload->>'version','')::integer;
    update public.appointments set patient_id=patient, professional_id=nullif(payload->>'professional_id','')::uuid,
      procedure_id=nullif(payload->>'procedure_id','')::uuid,
      procedure_snapshot=coalesce(payload->'procedure_snapshot','{}'::jsonb),
      label=coalesce(payload->>'label',''), starts_at=starts, ends_at=ends, status=coalesce(payload->>'status','agendado')
      where organization_id=org and id=existing_id and version=expected returning id into first_id;
    if first_id is null then raise exception using errcode='40001',message='appointment_version_conflict'; end if;
  else
    for i in 0..session_count-1 loop
      insert into public.appointments(organization_id,patient_id,professional_id,procedure_id,procedure_snapshot,label,starts_at,ends_at,status,recurrence_group_id,recurrence_index,booking_request_id,created_by)
      values(org,patient,nullif(payload->>'professional_id','')::uuid,nullif(payload->>'procedure_id','')::uuid,coalesce(payload->'procedure_snapshot','{}'::jsonb),coalesce(payload->>'label',''),
        starts+make_interval(days=>i*interval_days),ends+make_interval(days=>i*interval_days),coalesce(payload->>'status','agendado'),group_id,i+1,request_id,auth.uid()) returning id into inserted_id;
      if i=0 then first_id:=inserted_id; end if;
    end loop;
  end if;
  if follow_up_id is not null then perform public.set_follow_up_status(follow_up_id,'agendado',first_id); end if;
  return first_id;
end $$;
revoke all on function public.save_appointment_series(jsonb,integer,integer,uuid,uuid) from public,anon;
grant execute on function public.save_appointment_series(jsonb,integer,integer,uuid,uuid) to authenticated;
commit;
