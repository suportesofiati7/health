begin;

-- Keep the two full-access identities distinct while retaining the existing
-- role keys used by RLS and the application.
update public.memberships
set role = 'suporte_ti', updated_at = now()
where organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'::uuid
  and lower(email) = 'team.ashtra.ai@gmail.com'
  and role = 'proprietario';

update public.staff_role_catalog
set description_pt = 'Proprietária da clínica: acesso total, pessoas, configurações, auditoria, dados e continuidade.',
    description_en = 'Clinic owner: full access to people, settings, audit, data and continuity.'
where role = 'proprietario';
update public.staff_role_catalog
set description_pt = 'Proprietário do software, com acesso total ao sistema.',
    description_en = 'Software owner with full access to the system.'
where role = 'suporte_ti';

-- Both owner roles retain the same full-access behavior. The software-owner
-- identity is the only identity allowed to remove the clinic-owner identity;
-- the inverse operation is rejected here before any row is changed.
create or replace function private.can_delete_membership(target_email text)
returns boolean language sql stable security definer set search_path = '' as $$
  select lower(coalesce(target_email, '')) <> 'team.ashtra.ai@gmail.com'
      or lower(coalesce((select email from public.memberships where user_id = auth.uid() and organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'::uuid), '')) = 'team.ashtra.ai@gmail.com';
$$;
revoke all on function private.can_delete_membership(text) from public, anon;
grant execute on function private.can_delete_membership(text) to authenticated, service_role;

create or replace function private.finance_access(org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_role(org, array['proprietario']);
$$;

create or replace function public.authorize_full_backup() returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_role('a783bd4c-f253-4a94-9365-75c6f1000001'::uuid, array['proprietario']);
$$;
revoke all on function public.authorize_full_backup() from public, anon;
grant execute on function public.authorize_full_backup() to authenticated;

-- Existing owner-only deletion safeguards must recognize both full owners.
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
end;
$$;

revoke all on function public.delete_patient(uuid) from public, anon;
grant execute on function public.delete_patient(uuid) to authenticated;

commit;
