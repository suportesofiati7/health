begin;

-- Delete the calendar booking while retaining its independent patient records.
create or replace function public.delete_appointment(target_appointment uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare a public.appointments;
begin
  select * into a from public.appointments where id=target_appointment for update;
  if not found then raise exception 'appointment_not_found'; end if;
  if not private.has_permission(a.organization_id,'appointments','delete')
     or not private.has_permission(a.organization_id,'appointments','view') then
    raise exception 'not_authorized';
  end if;

  update public.clinical_procedures set appointment_id=null where organization_id=a.organization_id and appointment_id=a.id;
  update public.follow_ups set appointment_id=null where organization_id=a.organization_id and appointment_id=a.id;
  update public.communications set appointment_id=null where organization_id=a.organization_id and appointment_id=a.id;
  update public.communication_conversations set appointment_id=null where organization_id=a.organization_id and appointment_id=a.id;
  update public.patient_portal_actions set appointment_id=null where organization_id=a.organization_id and appointment_id=a.id;

  insert into public.audit_events(organization_id,actor_id,action,entity_type,entity_id)
  values(a.organization_id,auth.uid(),'appointment_permanently_deleted','appointments',a.id);
  delete from public.appointments where organization_id=a.organization_id and id=a.id;
end;
$$;
revoke all on function public.delete_appointment(uuid) from public, anon;
grant execute on function public.delete_appointment(uuid) to authenticated;

commit;
