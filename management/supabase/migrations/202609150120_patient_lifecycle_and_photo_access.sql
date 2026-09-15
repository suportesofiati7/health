begin;

-- Patient profile photos are clinic-owned objects.  The previous policy only
-- allowed the authenticated user's id in the second path segment, which made
-- patient photos impossible for staff to replace or remove.
drop policy if exists profile_photo_write on storage.objects;
create policy profile_photo_write on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-photos'
  and (
    split_part(name, '/', 2) = auth.uid()::text
    or private.has_permission(split_part(name, '/', 1)::uuid, 'patient_identity', 'edit')
  )
);

drop policy if exists profile_photo_update on storage.objects;
create policy profile_photo_update on storage.objects for update to authenticated
using (
  bucket_id = 'profile-photos'
  and (
    split_part(name, '/', 2) = auth.uid()::text
    or private.has_permission(split_part(name, '/', 1)::uuid, 'patient_identity', 'edit')
  )
)
with check (
  bucket_id = 'profile-photos'
  and (
    split_part(name, '/', 2) = auth.uid()::text
    or private.has_permission(split_part(name, '/', 1)::uuid, 'patient_identity', 'edit')
  )
);

drop policy if exists profile_photo_delete on storage.objects;
create policy profile_photo_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-photos'
  and (
    split_part(name, '/', 2) = auth.uid()::text
    or private.has_permission(split_part(name, '/', 1)::uuid, 'patient_identity', 'edit')
  )
);

-- Archive is a reversible status change. Permanent deletion is deliberately a
-- single audited RPC so the payment rule and dependent records are enforced
-- server-side for every client.
create or replace function public.delete_patient(target_patient uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  p public.patients;
  owner_delete boolean;
  paid boolean;
begin
  select * into p from public.patients where id = target_patient for update;
  if not found then raise exception 'patient_not_found'; end if;
  if not private.has_role(p.organization_id, array['proprietario','profissional','recepcao']) then
    raise exception 'not_authorized';
  end if;
  owner_delete := exists (
    select 1 from public.memberships m
    where m.organization_id = p.organization_id and m.user_id = auth.uid()
      and m.status = 'ativo' and m.role = 'proprietario'
      and lower(m.email) = 'suportesofiati@gmail.com'
  );
  paid := exists (select 1 from public.financial_payments where patient_id = p.id);
  if paid and not owner_delete then raise exception 'patient_has_payment'; end if;

  insert into public.audit_events(organization_id, actor_id, action, entity_type, entity_id)
  values(p.organization_id, auth.uid(), 'patient_permanently_deleted', 'patients', p.id);

  -- Remove private objects before metadata rows disappear.
  delete from storage.objects where bucket_id = 'profile-photos' and name like p.organization_id::text || '/patient/' || p.id::text || '/%';
  delete from storage.objects where bucket_id = 'clinical-photos' and name like p.organization_id::text || '/' || p.id::text || '/%';
  delete from storage.objects where bucket_id = 'patient-files' and name like p.organization_id::text || '/' || p.id::text || '/%';

  delete from public.patient_portal_sessions where account_id in (select id from public.patient_portal_accounts where patient_id = p.id);
  delete from public.patient_portal_accounts where patient_id = p.id;
  delete from public.document_links where patient_id = p.id;
  delete from public.clinical_photos where patient_id = p.id;
  delete from public.consents where patient_id = p.id;
  delete from public.product_usages where clinical_procedure_id in (select id from public.clinical_procedures where patient_id = p.id);
  delete from public.clinical_procedures where patient_id = p.id;
  delete from public.treatment_plan_items where plan_id in (select id from public.treatment_plans where patient_id = p.id);
  delete from public.treatment_plans where patient_id = p.id;
  delete from public.follow_ups where patient_id = p.id;
  delete from public.adverse_events where patient_id = p.id;
  delete from public.patient_health_history where patient_id = p.id;
  delete from public.privacy_requests where patient_id = p.id;
  delete from public.entry_versions where entry_id in (select id from public.entries where patient_id = p.id);
  update public.entries set parent_id = null, amends_id = null where patient_id = p.id;
  delete from public.entries where patient_id = p.id;
  delete from public.admin_notes where patient_id = p.id;
  delete from public.communications where patient_id = p.id;
  delete from public.communication_messages where conversation_id in (select id from public.communication_conversations where patient_id = p.id);
  delete from public.communication_conversations where patient_id = p.id;
  delete from public.communication_preferences where patient_id = p.id;
  delete from public.master_intakes where patient_id = p.id;
  delete from public.appointments where patient_id = p.id;
  delete from public.tasks where patient_id = p.id;
  delete from public.financial_payments where patient_id = p.id;
  delete from public.financial_records where patient_id = p.id;
  delete from public.documents where patient_id = p.id;
  delete from public.public_intakes where patient_id = p.id;
  delete from public.enquiries where patient_id = p.id;
  delete from public.patients where id = p.id;
end $$;

revoke all on function public.delete_patient(uuid) from public, anon;
grant execute on function public.delete_patient(uuid) to authenticated;

commit;
