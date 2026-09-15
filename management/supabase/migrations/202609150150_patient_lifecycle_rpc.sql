begin;

-- Lifecycle changes run through audited, security-definer functions so the
-- archive action is not dependent on whichever client-side RLS policies are
-- currently active.
create or replace function public.archive_patient(target_patient uuid, archived boolean)
returns public.patients
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.patients;
  next_status text := case when archived then 'inativo' else 'ativo' end;
begin
  select * into p from public.patients where id = target_patient for update;
  if not found then raise exception 'patient_not_found'; end if;
  if not private.has_role(p.organization_id, array['proprietario','profissional','recepcao']) then
    raise exception 'not_authorized';
  end if;

  update public.patients
  set status = next_status, updated_at = now(), version = version + 1
  where id = target_patient
  returning * into p;

  insert into public.audit_events(organization_id, actor_id, action, entity_type, entity_id)
  values(p.organization_id, auth.uid(), case when archived then 'patient_archived' else 'patient_restored' end, 'patients', p.id);
  return p;
end $$;

revoke all on function public.archive_patient(uuid, boolean) from public, anon;
grant execute on function public.archive_patient(uuid, boolean) to authenticated;

-- A proprietor can permanently delete an unused record. Payment-bearing
-- records remain restricted to the proprietor role and keep their audit trail.
create or replace function public.delete_patient(target_patient uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  p public.patients;
  owner_delete boolean;
  paid boolean;
begin
  select * into p from public.patients where id = target_patient for update;
  if not found then raise exception 'patient_not_found'; end if;
  if not private.has_role(p.organization_id, array['proprietario','profissional','recepcao']) then raise exception 'not_authorized'; end if;
  owner_delete := private.has_role(p.organization_id, array['proprietario']);
  paid := exists (select 1 from public.financial_payments where patient_id = p.id and status = 'recebido');
  if paid and not owner_delete then raise exception 'patient_has_payment'; end if;

  insert into public.audit_events(organization_id, actor_id, action, entity_type, entity_id)
  values(p.organization_id, auth.uid(), 'patient_permanently_deleted', 'patients', p.id);

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
