\set ON_ERROR_STOP on
begin;
create function pg_temp.assert(ok boolean, message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',message; end if; raise notice 'PASS: %',message; end $$;
create function pg_temp.reject(command text, expected text) returns void language plpgsql as $$
begin
  begin execute command; exception when others then
    if sqlerrm not like '%' || expected || '%' then raise exception 'Wrong failure: % (expected %)',sqlerrm,expected; end if;
    raise notice 'PASS rejected: %',expected; return;
  end;
  raise exception 'FAIL allowed: %',expected;
end $$;
insert into auth.users values ('11000000-0000-4000-8000-000000000001'),('11000000-0000-4000-8000-000000000002');
insert into auth.sessions values ('21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001'),('21000000-0000-4000-8000-000000000002','11000000-0000-4000-8000-000000000002');
insert into public.memberships(organization_id,user_id,name,email,role,status) values
('a783bd4c-f253-4a94-9365-75c6f1000001','11000000-0000-4000-8000-000000000001','Workflow QA owner','workflow-owner@example.invalid','proprietario','ativo'),
('a783bd4c-f253-4a94-9365-75c6f1000001','11000000-0000-4000-8000-000000000002','Workflow QA professional','workflow-professional@example.invalid','profissional','ativo');
insert into public.patients(id,organization_id,full_name,created_by) values
('31000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','Workflow patient A','11000000-0000-4000-8000-000000000001'),
('31000000-0000-4000-8000-000000000002','a783bd4c-f253-4a94-9365-75c6f1000001','Workflow patient B','11000000-0000-4000-8000-000000000001');
-- Notification evidence is durable, idempotent, and isolated from patient writes.
insert into public.public_intakes(id,organization_id,full_name,form_version,payload,status,patient_id)
values ('91000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','Notification QA','test','{}','convertido','31000000-0000-4000-8000-000000000001');
update public.public_intakes set status='convertido' where id='91000000-0000-4000-8000-000000000001';
select pg_temp.assert((select count(*)=1 from public.intake_notification_outbox where intake_id='91000000-0000-4000-8000-000000000001'),'notification is queued once across completion retries');
select pg_temp.assert((select count(*)=1 from public.claim_intake_notifications()),'worker claims eligible job');
select pg_temp.assert((select count(*)=0 from public.claim_intake_notifications()),'worker lease prevents concurrent duplicate claim');
update public.intake_notification_outbox set status='failed',last_error='provider_unavailable' where intake_id='91000000-0000-4000-8000-000000000001';
select pg_temp.assert((select patient_id is not null from public.public_intakes where id='91000000-0000-4000-8000-000000000001'),'failed notification leaves saved intake associated');
insert into public.public_intakes(id,organization_id,full_name,cpf,form_version,payload)
values ('92000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','Association QA','52998224725','qa-v1','{"birth_date":"1990-01-01","health_notes":"unverified declaration"}');
select public.associate_completed_form('92000000-0000-4000-8000-000000000001');
select public.associate_completed_form('92000000-0000-4000-8000-000000000001');
select pg_temp.assert((select count(*)=1 from public.entries where data->>'intake_id'='92000000-0000-4000-8000-000000000001'),'association retry creates one clinical marker');
select pg_temp.assert((select reviewed_at is null from public.public_intakes where id='92000000-0000-4000-8000-000000000001'),'automatic association does not claim professional review');
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub','11000000-0000-4000-8000-000000000002','session_id','21000000-0000-4000-8000-000000000002','exp',extract(epoch from now()-interval '1 hour'))::text,true);
select pg_temp.assert(not private.has_permission('a783bd4c-f253-4a94-9365-75c6f1000001','procedures','create'),'expired professional cannot use granular permissions');
select set_config('request.jwt.claims',jsonb_build_object('sub','11000000-0000-4000-8000-000000000001','session_id','21000000-0000-4000-8000-000000000001','exp',extract(epoch from now()+interval '1 hour'))::text,true);
insert into public.procedures(id,organization_id,name,category,default_duration,interval_days,followup_days,required_consents) values
('41000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','Workflow treatment','QA',30,7,14,'[]');
insert into public.treatment_plans(id,organization_id,patient_id,title,responsible_user) values
('51000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000001','Workflow plan','11000000-0000-4000-8000-000000000001');
insert into public.treatment_plan_items(id,organization_id,plan_id,procedure_id,sessions) values
('61000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','51000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000001',2);
select pg_temp.reject($q$insert into public.clinical_procedures(organization_id,patient_id,procedure_id,professional_id,plan_id) values('a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000002','41000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001')$q$,'patient_relationship_mismatch');
select pg_temp.assert(public.schedule_treatment_plan('51000000-0000-4000-8000-000000000001','2026-12-01','09:00')=2,'plan schedules both sessions');
select pg_temp.assert(public.schedule_treatment_plan('51000000-0000-4000-8000-000000000001','2026-12-01','09:00')=0,'repeated scheduling does not duplicate sessions');
select pg_temp.assert((select count(*)=2 and min(starts_at)='2026-12-01T09:00:00-03:00'::timestamptz from public.appointments where patient_id='31000000-0000-4000-8000-000000000001'),'appointment persistence uses clinic timezone');
insert into public.clinical_procedures(id,organization_id,patient_id,procedure_id,professional_id,performed_at,status) values
('71000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','2026-10-01T23:00:00-03:00','rascunho');
select pg_temp.reject($q$insert into public.clinical_photos(organization_id,patient_id,clinical_procedure_id,path,category,mime_type,size_bytes) values('a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000001','qa/cross-patient.png','antes','image/png',100)$q$,'patient_relationship_mismatch');
select pg_temp.reject($q$insert into public.consents(organization_id,patient_id,clinical_procedure_id,kind,template_version) values('a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000001','procedimento','v1')$q$,'patient_relationship_mismatch');
select pg_temp.reject($q$insert into public.follow_ups(organization_id,patient_id,clinical_procedure_id,expected_on) values('a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000001',current_date)$q$,'patient_relationship_mismatch');
-- Finalization needs its own permission, even when the caller can create/edit drafts.
reset role;
update public.staff_permissions set can_finalize=false where user_id='11000000-0000-4000-8000-000000000002' and area='procedures';
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub','11000000-0000-4000-8000-000000000002','session_id','21000000-0000-4000-8000-000000000002','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select pg_temp.reject($q$update public.clinical_procedures set status='finalizado' where id='71000000-0000-4000-8000-000000000001'$q$,'procedure_finalize_denied');
select public.revoke_current_session();
select pg_temp.assert(not private.has_permission('a783bd4c-f253-4a94-9365-75c6f1000001','photos','create'),'revoked professional loses granular write permissions');
select set_config('request.jwt.claims',jsonb_build_object('sub','11000000-0000-4000-8000-000000000001','session_id','21000000-0000-4000-8000-000000000001','exp',extract(epoch from now()+interval '1 hour'))::text,true);
update public.procedures set required_consents='["procedimento"]' where id='41000000-0000-4000-8000-000000000001';
select pg_temp.reject($q$update public.clinical_procedures set status='finalizado',consent_status='aceito' where id='71000000-0000-4000-8000-000000000001'$q$,'procedure_consent_evidence_required');
insert into public.consents(organization_id,patient_id,clinical_procedure_id,procedure_id,kind,template_version,status,accepted_at) values('a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000001','procedimento','v1','aceito',now());
update public.clinical_procedures set status='finalizado',consent_status='aceito' where id='71000000-0000-4000-8000-000000000001';
select pg_temp.assert((select count(*)=1 and min(expected_on)='2026-10-15'::date from public.follow_ups where clinical_procedure_id='71000000-0000-4000-8000-000000000001'),'one follow-up uses performed date, not save date');
select public.generate_action_centre_tasks();
select pg_temp.assert((select count(*)=1 from public.tasks t join public.follow_ups f on t.source_id=f.id where f.clinical_procedure_id='71000000-0000-4000-8000-000000000001'),'follow-up appears in action centre');
select public.set_follow_up_status((select id from public.follow_ups where clinical_procedure_id='71000000-0000-4000-8000-000000000001'),'concluido');
select pg_temp.assert((select bool_and(t.status='concluida') from public.tasks t join public.follow_ups f on t.source_id=f.id where f.clinical_procedure_id='71000000-0000-4000-8000-000000000001'),'completing follow-up resolves linked task');
select pg_temp.assert((select count(*)>=2 from public.audit_events where entity_id='71000000-0000-4000-8000-000000000001'),'clinical draft and finalization have database audit events');
-- The second recurrence overlaps: the first must roll back as well.
insert into public.appointments(organization_id,patient_id,professional_id,starts_at,ends_at,status,label) values('a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','2026-12-08T10:00:00-03:00','2026-12-08T10:30:00-03:00','agendado','collision');
select pg_temp.reject($q$select public.save_appointment_series('{"organization_id":"a783bd4c-f253-4a94-9365-75c6f1000001","patient_id":"31000000-0000-4000-8000-000000000001","professional_id":"11000000-0000-4000-8000-000000000001","starts_at":"2026-12-01T10:00:00-03:00","ends_at":"2026-12-01T10:30:00-03:00","label":"rollback-series"}',2,7)$q$,'appointments_no_professional_overlap');
select pg_temp.assert((select count(*)=0 from public.appointments where label='rollback-series'),'failed recurrence leaves no partial appointment');
select pg_temp.assert(public.save_appointment_series('{"organization_id":"a783bd4c-f253-4a94-9365-75c6f1000001","patient_id":"31000000-0000-4000-8000-000000000001","starts_at":"2026-12-01T11:00:00-03:00","ends_at":"2026-12-01T11:30:00-03:00","label":"idempotent-series"}',2,7,null,'81000000-0000-4000-8000-000000000001')=public.save_appointment_series('{"organization_id":"a783bd4c-f253-4a94-9365-75c6f1000001","patient_id":"31000000-0000-4000-8000-000000000001","starts_at":"2026-12-01T11:00:00-03:00","ends_at":"2026-12-01T11:30:00-03:00","label":"idempotent-series"}',2,7,null,'81000000-0000-4000-8000-000000000001'),'retry returns same persisted appointment');
select pg_temp.assert((select count(*)=2 from public.appointments where label='idempotent-series'),'retry keeps exactly two sessions');
insert into public.patient_portal_actions(organization_id,patient_id,appointment_id,action_type)
  select organization_id,patient_id,id,'confirmar_agendamento' from public.appointments where label='idempotent-series' and recurrence_index=1;
update public.patient_portal_actions set status='concluida' where action_type='confirmar_agendamento';
select pg_temp.assert((select status='confirmado' from public.appointments where label='idempotent-series' and recurrence_index=1),'resolving portal confirmation updates appointment status');
select pg_temp.assert((select resolved_by=auth.uid() from public.patient_portal_actions where action_type='confirmar_agendamento'),'portal resolution records responsible staff member');
select pg_temp.reject($q$update public.appointments set patient_id='31000000-0000-4000-8000-000000000002' where label='idempotent-series' and recurrence_index=1$q$,'patient_relationship_mismatch');
update public.consents set status='revogado' where clinical_procedure_id='71000000-0000-4000-8000-000000000001';
select pg_temp.assert((select count(*)=1 from public.consent_versions where snapshot->>'status'='aceito'),'revocation preserves original accepted consent evidence');
-- Session-specific material snapshots and inventory must commit atomically.
update public.procedures set required_consents='[]',lot_required=true where id='41000000-0000-4000-8000-000000000001';
insert into public.products(id,organization_id,name,manufacturer,unit) values
('91000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','QA serum','QA brand','mL');
insert into public.product_lots(id,organization_id,product_id,lot,expires_on,unit) values
('92000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','91000000-0000-4000-8000-000000000001','STOCK-1',current_date+365,'mL');
do $$
declare
  payload jsonb := '{"organization_id":"a783bd4c-f253-4a94-9365-75c6f1000001","patient_id":"31000000-0000-4000-8000-000000000001","procedure_id":"41000000-0000-4000-8000-000000000001","professional_id":"11000000-0000-4000-8000-000000000001","parameters":{"equipment":[{"name":"Session device","settings":"12 J"}]}}';
  record_id uuid;
  before_count integer;
begin
  record_id := public.record_clinical_procedure(payload, '[{"name":"Personal serum","manufacturer":"Individual brand","lot":"MANUAL-1","quantity":2,"unit":"mL"},{"name":"Needle","lot":"MANUAL-2","notes":"Single use"}]');
  perform pg_temp.assert((select status='finalizado' and jsonb_array_length(parameters->'materials')=2 and parameters#>>'{equipment,0,settings}'='12 J' from public.clinical_procedures where id=record_id),'manual lots finalize with multiple products and equipment snapshot');
  perform pg_temp.assert(not exists(select 1 from public.inventory_movements where clinical_procedure_id=record_id),'manual supplies do not consume stock');
  record_id := public.record_clinical_procedure(payload, '[{"lot_id":"92000000-0000-4000-8000-000000000001","name":"Attempted override","quantity":2,"unit":"mL"},{"name":"Manual item","lot":"LOCAL-3"}]');
  perform pg_temp.assert((select parameters#>>'{materials,0,name}'='QA serum' and parameters#>>'{materials,0,lot}'='STOCK-1' from public.clinical_procedures where id=record_id),'linked lots snapshot the actual stock product identity');
  perform pg_temp.assert((select count(*)=1 and sum(quantity)=2 from public.inventory_movements where clinical_procedure_id=record_id),'mixed entries consume only the selected stock lot');
  select count(*) into before_count from public.clinical_procedures;
  begin
    perform public.record_clinical_procedure(payload, '[{"name":"Valid","lot":"OK"},{"name":"Expired","expires_on":"2000-01-01"}]');
    raise exception 'FAIL accepted expired manual lot';
  exception when sqlstate '22023' then null; end;
  perform pg_temp.assert((select count(*)=before_count from public.clinical_procedures),'invalid later item leaves no partial procedure');
  begin
    perform public.record_clinical_procedure(payload, '[{"name":"Missing lot"}]');
    raise exception 'FAIL accepted missing required lot';
  exception when sqlstate '22023' then null; end;
  perform pg_temp.assert((select count(*)=before_count from public.clinical_procedures),'required lot is enforced for manual entries');
end $$;


-- Deleting populated conversations must work under authenticated RLS.
insert into public.communication_conversations(id,organization_id,title,kind,created_by)
values ('c1000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','Deletion QA','equipe','11000000-0000-4000-8000-000000000001');
insert into public.communication_messages(id,organization_id,conversation_id,sender_id,body)
values ('c2000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','c1000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','Private deletion fixture');
update public.communication_messages set deleted_at=now() where id='c2000000-0000-4000-8000-000000000001';
select pg_temp.assert((select deleted_by=auth.uid() from public.communication_messages where id='c2000000-0000-4000-8000-000000000001'),'message deletion records the acting user');
select pg_temp.assert((select last_message_preview='Mensagem excluída' from public.communication_conversations where id='c1000000-0000-4000-8000-000000000001'),'deleted message content is removed from conversation preview');
delete from public.communication_conversations where id='c1000000-0000-4000-8000-000000000001';
select pg_temp.assert(not exists(select 1 from public.communication_conversations where id='c1000000-0000-4000-8000-000000000001'),'populated chat can be deleted');
select pg_temp.assert(not exists(select 1 from public.communication_messages where id='c2000000-0000-4000-8000-000000000001'),'chat deletion cascades to its messages');

-- The waitlist browser omits created_by and uses NULL for any procedure.
insert into public.waitlist_entries(id,organization_id,patient_id,procedure_id,priority)
values ('d1000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000001',null,'urgente'),
       ('d1000000-0000-4000-8000-000000000002','a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000001','alta');
select pg_temp.assert((select count(*)=2 and bool_and(created_by=auth.uid()) from public.waitlist_entries where id in ('d1000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000002')),'waitlist accepts any or selected procedure and defaults to the authenticated creator');
update public.waitlist_entries set status='cancelado' where id='d1000000-0000-4000-8000-000000000001';
select pg_temp.assert((select status='cancelado' from public.waitlist_entries where id='d1000000-0000-4000-8000-000000000001'),'waitlist removal persists under authenticated RLS');


insert into public.appointments(id,organization_id,patient_id,starts_at,ends_at,status)
values ('e1000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000001','2026-12-20T09:00:00-03','2026-12-20T10:00:00-03','concluido');
insert into public.clinical_procedures(id,organization_id,patient_id,procedure_id,professional_id,appointment_id)
values ('e2000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','31000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001');
insert into public.communication_conversations(id,organization_id,title,appointment_id)
values ('e3000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','Booking context','e1000000-0000-4000-8000-000000000001');
select set_config('request.jwt.claims',jsonb_build_object('sub','11000000-0000-4000-8000-000000000002','session_id','21000000-0000-4000-8000-000000000002','exp',extract(epoch from now()-interval '1 hour'))::text,true);
select pg_temp.reject($q$select public.delete_appointment('e1000000-0000-4000-8000-000000000001')$q$,'not_authorized');
select set_config('request.jwt.claims',jsonb_build_object('sub','11000000-0000-4000-8000-000000000001','session_id','21000000-0000-4000-8000-000000000001','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select public.delete_appointment('e1000000-0000-4000-8000-000000000001');
select pg_temp.assert(not exists(select 1 from public.appointments where id='e1000000-0000-4000-8000-000000000001'),'completed appointment is permanently deleted');
select pg_temp.assert((select appointment_id is null from public.clinical_procedures where id='e2000000-0000-4000-8000-000000000001'),'appointment deletion retains clinical procedure');
select pg_temp.assert((select appointment_id is null from public.communication_conversations where id='e3000000-0000-4000-8000-000000000001'),'appointment deletion retains communication context');
select pg_temp.assert(exists(select 1 from public.audit_events where entity_id='e1000000-0000-4000-8000-000000000001' and action='appointment_permanently_deleted'),'appointment deletion is audited');
select pg_temp.reject($q$select public.delete_appointment('e1000000-0000-4000-8000-000000000001')$q$,'appointment_not_found');

rollback;
