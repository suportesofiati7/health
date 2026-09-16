begin;

-- Form deletion is separate from patient deletion. It removes the intake and
-- its private uploads, but never removes a patient created from that form.
create or replace function public.delete_public_intake(target_intake uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  i public.public_intakes;
begin
  select * into i from public.public_intakes where id = target_intake for update;
  if not found then raise exception 'intake_not_found'; end if;
  if not private.has_role(i.organization_id, array['proprietario','profissional','recepcao']) then
    raise exception 'not_authorized';
  end if;
  if i.retention_hold and not private.has_role(i.organization_id, array['proprietario']) then
    raise exception 'retention_hold';
  end if;

  insert into public.audit_events(organization_id, actor_id, action, entity_type, entity_id)
    values(i.organization_id, auth.uid(), 'public_intake_deleted', 'public_intake', i.id);
  delete from storage.objects
    where bucket_id = 'intake-private'
      and name like i.organization_id::text || '/' || i.id::text || '/%';
  delete from public.public_intakes where id = i.id;
end $$;

revoke all on function public.delete_public_intake(uuid) from public, anon;
grant execute on function public.delete_public_intake(uuid) to authenticated;

commit;
