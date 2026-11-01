begin;
-- Upload metadata editing existed in the UI but had neither an UPDATE grant
-- nor an UPDATE policy, so byte upload succeeded while saving the form failed.
grant update(description,document_date) on public.documents to authenticated;
create policy document_metadata_update on public.documents for update to authenticated
  using(private.has_permission(organization_id,'documents','edit'))
  with check(private.has_permission(organization_id,'documents','edit'));

-- Staff must not receive 'shared' success for a UUID belonging to another
-- patient or for a resource kind the portal cannot resolve.
create function private.portal_share_relationship_guard() returns trigger
language plpgsql security definer set search_path='' as $$
declare source_table text; patient uuid;
begin
  if new.status<>'shared' then return new; end if;
  source_table:=case new.resource_type when 'document' then 'documents' when 'report' then 'documents' when 'photo' then 'clinical_photos' when 'consent' then 'consents' when 'appointment' then 'appointments' when 'post_care' then 'clinical_procedures' end;
  if source_table is null or new.resource_id is null then raise exception 'portal_resource_required'; end if;
  execute format('select patient_id from public.%I where organization_id=$1 and id=$2 for update',source_table) into patient using new.organization_id,new.resource_id;
  if patient is distinct from new.patient_id then raise exception 'patient_relationship_mismatch'; end if;
  return new;
end $$;
create trigger portal_share_relationship_guard before insert or update on public.patient_portal_shares for each row execute function private.portal_share_relationship_guard();

-- Concurrent payments must serialize on the invoice before summing receipts.
-- Without this lock two valid individual payments can jointly overpay it.
create or replace function private.finance_payment_guard()
returns trigger language plpgsql security definer set search_path='' as $$
declare total integer; received integer;
begin
  if tg_op='UPDATE' and (new.record_id<>old.record_id or new.patient_id<>old.patient_id or new.organization_id<>old.organization_id) then raise exception 'immutable_payment_identity'; end if;
  select total_cents into total from public.financial_records
    where id=new.record_id and organization_id=new.organization_id and patient_id=new.patient_id for update;
  if total is null then raise exception 'invalid_financial_record'; end if;
  if new.status='recebido' then
    select coalesce(sum(amount_cents),0) into received from public.financial_payments
      where record_id=new.record_id and organization_id=new.organization_id and status='recebido' and (tg_op<>'UPDATE' or id<>new.id);
    if received+new.amount_cents>total then raise exception 'finance_payment_over_total'; end if;
  end if;
  return new;
end $$;
commit;
