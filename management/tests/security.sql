\set ON_ERROR_STOP on
begin;
create function pg_temp.assert(ok boolean, message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',message; end if; raise notice 'PASS: %',message; end $$;
create function pg_temp.denied(command text, message text) returns void language plpgsql as $$
begin
  begin execute command; exception when others then raise notice 'PASS denied: %',message; return; end;
  raise exception 'FAIL allowed: %',message;
end $$;
insert into auth.users values
('10000000-0000-4000-8000-000000000001'),('10000000-0000-4000-8000-000000000002'),
('10000000-0000-4000-8000-000000000003'),('10000000-0000-4000-8000-000000000004'),
('10000000-0000-4000-8000-000000000005');
insert into auth.sessions select ('20000000-0000-4000-8000-'||right(id::text,12))::uuid,id from auth.users;
insert into public.memberships(organization_id,user_id,name,email,role,status)
select 'a783bd4c-f253-4a94-9365-75c6f1000001',id,'Fictional test',id::text||'@example.invalid',
case right(id::text,1) when '1' then 'proprietario' when '2' then 'profissional' when '3' then 'recepcao' else 'leitura' end,
case right(id::text,1) when '5' then 'inativo' else 'ativo' end from auth.users;
insert into public.organizations values('a783bd4c-f253-4a94-9365-75c6f1000002','Other fictional clinic',now());
insert into public.patients(id,organization_id,full_name,created_by) values
('30000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','Fictional patient','10000000-0000-4000-8000-000000000001'),
('30000000-0000-4000-8000-000000000002','a783bd4c-f253-4a94-9365-75c6f1000002','Other clinic patient','10000000-0000-4000-8000-000000000001');
insert into public.documents(id,organization_id,patient_id,name,path,mime_type,size_bytes,sha256,status,created_by) values
('80000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','30000000-0000-4000-8000-000000000001','fictional.pdf','clinic1/fictional.pdf','application/pdf',100,repeat('a',64),'pronto','10000000-0000-4000-8000-000000000001'),
('80000000-0000-4000-8000-000000000002','a783bd4c-f253-4a94-9365-75c6f1000002','30000000-0000-4000-8000-000000000002','other.pdf','clinic2/other.pdf','application/pdf',100,repeat('b',64),'pronto','10000000-0000-4000-8000-000000000001');
insert into storage.objects(bucket_id,name) values('patient-files','clinic1/fictional.pdf'),('patient-files','clinic2/other.pdf');
insert into public.enquiries(id,organization_id,full_name) values('70000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','Fictional enquiry');
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000001','session_id','20000000-0000-4000-8000-000000000001','exp',extract(epoch from now()+interval '1 hour'))::text,true);
-- Seed the granular profile for the fictional reception user created above.
-- Production migrations seed existing memberships, while this test creates its
-- memberships after migrations have already run.
insert into public.staff_permissions(organization_id,user_id,area,can_view,can_create,can_edit,can_finalize,can_export,can_share,updated_by)
values('a783bd4c-f253-4a94-9365-75c6f1000001','10000000-0000-4000-8000-000000000003','patient_identity',true,true,true,false,false,false,'10000000-0000-4000-8000-000000000001')
on conflict (organization_id,user_id,area) do update set can_view=true,can_create=true,can_edit=true,updated_by=excluded.updated_by;
-- The access-role migration seeds this default for every new membership.
-- Keep the fixture explicit while allowing the production seed to coexist.
select pg_temp.assert((select count(*)=1 from public.patients),'owner sees only own organization');
select pg_temp.assert((select count(*)=1 from storage.objects),'owner reads own private file only');
select pg_temp.assert((select count(*)=0 from storage.objects where name='clinic2/other.pdf'),'guessing another clinic file path fails');
insert into public.procedures(organization_id,name,category,created_by) values('a783bd4c-f253-4a94-9365-75c6f1000001','Procedimento fictício E2E','teste','10000000-0000-4000-8000-000000000001');
insert into public.follow_ups(organization_id,patient_id,expected_on,created_by) values('a783bd4c-f253-4a94-9365-75c6f1000001','30000000-0000-4000-8000-000000000001',current_date,'10000000-0000-4000-8000-000000000001');
select pg_temp.assert((select count(*)=1 from public.procedures where name='Procedimento fictício E2E'),'owner can configure a fictional procedure');
select pg_temp.assert((select count(*)=1 from public.follow_ups),'owner can create a fictional follow-up');
select pg_temp.denied($q$insert into public.procedures(organization_id,name) values('a783bd4c-f253-4a94-9365-75c6f1000002','Other clinic procedure')$q$,'cross-organization procedure');

-- Catalogue edits commit the history with the price and preserve structured data.
update public.procedures set price_cents=12345, commercial_config='{"unit":"area"}'::jsonb
where name='Procedimento fictício E2E';
select pg_temp.assert((select count(*)=2 from public.procedure_versions v join public.procedures p on p.id=v.procedure_id where p.name='Procedimento fictício E2E'),'catalogue insert and edit each create one version');
select pg_temp.assert((select v.snapshot->>'price_cents'='12345' from public.procedure_versions v join public.procedures p on p.id=v.procedure_id where p.name='Procedimento fictício E2E' and v.version=2),'catalogue version contains saved price');
select public.save_treatment_plan(
  jsonb_build_object('organization_id','a783bd4c-f253-4a94-9365-75c6f1000001','patient_id','30000000-0000-4000-8000-000000000001','title','Atomic plan QA','objectives','Fictional objective','status','planejado'),
  jsonb_build_object('procedure_id',(select id from public.procedures where name='Procedimento fictício E2E'),'sequence_no',1,'sessions',3,'area','Fictional area','notes','Fixture')
);
select pg_temp.assert((select count(*)=1 from public.treatment_plans p join public.treatment_plan_items i on i.plan_id=p.id where p.title='Atomic plan QA' and i.sessions=3),'treatment plan and first item save atomically');
select public.save_treatment_plan(
  jsonb_build_object('id',(select id from public.treatment_plans where title='Atomic plan QA'),'organization_id','a783bd4c-f253-4a94-9365-75c6f1000001','patient_id','30000000-0000-4000-8000-000000000001','title','Atomic plan QA updated','objectives','Corrected objective','status','em_andamento'), null
);
select pg_temp.assert((select title='Atomic plan QA updated' and status='em_andamento' from public.treatment_plans where title='Atomic plan QA updated'),'existing treatment plan updates through role-checked RPC');
select public.save_treatment_plan(
  jsonb_build_object('id',(select id from public.treatment_plans where title='Atomic plan QA updated'),'organization_id','a783bd4c-f253-4a94-9365-75c6f1000001','patient_id','30000000-0000-4000-8000-000000000001','title','Atomic plan QA updated','objectives','Corrected objective','status','em_andamento'),
  jsonb_build_object('id',(select i.id from public.treatment_plan_items i join public.treatment_plans p on p.id=i.plan_id where p.title='Atomic plan QA updated'),'procedure_id',(select id from public.procedures where name='Procedimento fictício E2E'),'sequence_no',2,'sessions',4,'area','Corrected fictional area','notes','Updated fixture')
);
select pg_temp.assert((select i.sequence_no=2 and i.sessions=4 and i.area='Corrected fictional area' and i.notes='Updated fixture' from public.treatment_plan_items i join public.treatment_plans p on p.id=i.plan_id where p.title='Atomic plan QA updated'),'treatment plan item updates atomically and preserves its identity');
select public.set_treatment_plan_item_archived((select i.id from public.treatment_plan_items i join public.treatment_plans p on p.id=i.plan_id where p.title='Atomic plan QA updated'),true);
select pg_temp.assert((select archived_at is not null from public.treatment_plan_items i join public.treatment_plans p on p.id=i.plan_id where p.title='Atomic plan QA updated'),'treatment plan item archives without deletion');
select pg_temp.assert(public.schedule_treatment_plan((select id from public.treatment_plans where title='Atomic plan QA updated'))=0,'scheduler skips archived treatment plan items');
select public.set_treatment_plan_item_archived((select i.id from public.treatment_plan_items i join public.treatment_plans p on p.id=i.plan_id where p.title='Atomic plan QA updated'),false);
select pg_temp.assert((select archived_at is null from public.treatment_plan_items i join public.treatment_plans p on p.id=i.plan_id where p.title='Atomic plan QA updated'),'authorized user can restore an archived treatment plan item');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000003','session_id','20000000-0000-4000-8000-000000000003','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select pg_temp.denied($q$select public.set_treatment_plan_item_archived((select i.id from public.treatment_plan_items i join public.treatment_plans p on p.id=i.plan_id where p.title='Atomic plan QA updated'),true)$q$,'treatment plan item archive requires edit permission');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000001','session_id','20000000-0000-4000-8000-000000000001','exp',extract(epoch from now()+interval '1 hour'))::text,true);

-- Clinical procedure and inventory consumption are committed atomically.
insert into public.products(id,organization_id,name,unit,created_by)
values('b3000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','Fictional test serum','ml','10000000-0000-4000-8000-000000000001');
insert into public.product_lots(id,organization_id,product_id,lot,expires_on,quantity,unit,created_by)
values('b4000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','b3000000-0000-4000-8000-000000000001','EXPIRED-QA',current_date - 1,10,'ml','10000000-0000-4000-8000-000000000001'),
('b4000000-0000-4000-8000-000000000002','a783bd4c-f253-4a94-9365-75c6f1000001','b3000000-0000-4000-8000-000000000001','VALID-QA',current_date + 30,10,'ml','10000000-0000-4000-8000-000000000001');
select pg_temp.denied($q$
  select public.record_clinical_procedure(
    jsonb_build_object('organization_id','a783bd4c-f253-4a94-9365-75c6f1000001','patient_id','30000000-0000-4000-8000-000000000001','procedure_id',(select id from public.procedures where name='Procedimento fictício E2E'),'professional_id','10000000-0000-4000-8000-000000000001','indication','expired lot must not finalize'),
    jsonb_build_object('lot_id','b4000000-0000-4000-8000-000000000001','quantity',1,'unit','ml')
  )
$q$,'expired lot prevents clinical finalization');
select pg_temp.assert((select count(*)=0 from public.clinical_procedures where indication='expired lot must not finalize'),'expired lot failure leaves no finalized clinical record');
select public.record_clinical_procedure(
  jsonb_build_object('organization_id','a783bd4c-f253-4a94-9365-75c6f1000001','patient_id','30000000-0000-4000-8000-000000000001','procedure_id',(select id from public.procedures where name='Procedimento fictício E2E'),'professional_id','10000000-0000-4000-8000-000000000001','performed_at',now(),'area','Fictional QA','indication','atomic inventory test','technique','Fixture only','parameters','{}'::jsonb,'consent_status','nao_aplicavel'),
  jsonb_build_object('lot_id','b4000000-0000-4000-8000-000000000002','quantity',1,'unit','ml')
);
select pg_temp.assert((select count(*)=1 from public.clinical_procedures where indication='atomic inventory test' and status='finalizado' and finalized_at is not null),'clinical procedure finalizes through atomic RPC');
select pg_temp.assert((select count(*)=1 from public.product_usages u join public.clinical_procedures p on p.id=u.clinical_procedure_id where p.indication='atomic inventory test' and u.lot_id='b4000000-0000-4000-8000-000000000002'),'atomic procedure records product usage');
select pg_temp.assert((select count(*)=1 from public.inventory_movements m join public.clinical_procedures p on p.id=m.clinical_procedure_id where p.indication='atomic inventory test' and m.movement_type='consumo'),'product usage records inventory consumption');
insert into public.clinical_procedures(id,organization_id,patient_id,procedure_id,professional_id,performed_at,area,status,created_by)
select 'b5000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','30000000-0000-4000-8000-000000000001',id,'10000000-0000-4000-8000-000000000001',now(),'Draft fixture','rascunho','10000000-0000-4000-8000-000000000001'
from public.procedures where name='Procedimento fictício E2E';
select public.record_clinical_procedure(
  jsonb_build_object('id','b5000000-0000-4000-8000-000000000001','organization_id','a783bd4c-f253-4a94-9365-75c6f1000001','patient_id','30000000-0000-4000-8000-000000000001','procedure_id',(select id from public.procedures where name='Procedimento fictício E2E'),'professional_id','10000000-0000-4000-8000-000000000001','performed_at',now(),'indication','resumed draft','technique','completed by owner','parameters','{}'::jsonb,'consent_status','nao_aplicavel'), null
);
select pg_temp.assert((select status='finalizado' and indication='resumed draft' and technique='completed by owner' and finalized_at is not null from public.clinical_procedures where id='b5000000-0000-4000-8000-000000000001'),'existing clinical draft can be edited and finalized');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000003','session_id','20000000-0000-4000-8000-000000000003','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select pg_temp.denied($q$
  select public.record_clinical_procedure(
    jsonb_build_object('organization_id','a783bd4c-f253-4a94-9365-75c6f1000001','patient_id','30000000-0000-4000-8000-000000000001','procedure_id',(select id from public.procedures where name='Procedimento fictício E2E'),'professional_id','10000000-0000-4000-8000-000000000003'), null
  )
$q$,'reception cannot finalize clinical procedure through RPC');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000001','session_id','20000000-0000-4000-8000-000000000001','exp',extract(epoch from now()+interval '1 hour'))::text,true);

insert into public.clinical_procedures(id,organization_id,patient_id,procedure_id,professional_id,performed_at,history_only,status,consent_status,created_by)
select 'b2000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','30000000-0000-4000-8000-000000000001',id,null,null,true,'finalizado','aceito','10000000-0000-4000-8000-000000000001'
from public.procedures where name='Procedimento fictício E2E';
select pg_temp.assert((select count(*)=0 from public.follow_ups where clinical_procedure_id='b2000000-0000-4000-8000-000000000001'),'reported history does not create an invented follow-up');
reset role;
select pg_temp.denied($q$update public.clinical_procedures set history_only=false where id='b2000000-0000-4000-8000-000000000001'$q$,'ordinary treatment requires date and professional');
set local role authenticated;

-- The edge function writes as service role. Exercise its database projection
-- without making any network requests or accepting an unchecked term.
reset role;
insert into public.public_intakes(id,organization_id,patient_id,full_name,form_version,payload)
values('b1000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','30000000-0000-4000-8000-000000000001','Fictional intake','2026-10-28',
'{"selected_procedures":["toxina"],"accepted_term_toxina":"yes","accepted_term_plasma":"yes","lgpd_personal_data_consent":"yes","technical_image_authorisation":"no","marketing_image_authorisation":"partial_approval"}'::jsonb);
update public.public_intakes set patient_id=patient_id where id='b1000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.assert((select count(*)=4 from public.consents where source_intake_id='b1000000-0000-4000-8000-000000000001'),'intake consent projection is idempotent and excludes unselected procedure');
select pg_temp.assert((select status='recusado' and accepted_at is null from public.consents where source_intake_id='b1000000-0000-4000-8000-000000000001' and source_field='technical_image_authorisation'),'explicit photo refusal is preserved');
select pg_temp.assert((select authorization_choice='partial_approval' and patient_answers->>'choice'='partial_approval' from public.consents where source_intake_id='b1000000-0000-4000-8000-000000000001' and source_field='marketing_image_authorisation'),'conditional marketing choice and evidence are preserved');

-- Internal communication: team messages, direct-chat isolation, reactions,
-- read state, notification fan-out, edit and soft-delete behavior.
insert into public.communication_conversations(id,organization_id,title,kind,created_by)
values('a1000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','Security test room','equipe','10000000-0000-4000-8000-000000000001');
insert into public.communication_messages(id,organization_id,conversation_id,sender_id,body,client_message_id)
values('a2000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','a1000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Security test message',gen_random_uuid());
select pg_temp.assert((select last_message_preview='Security test message' from public.communication_conversations where id='a1000000-0000-4000-8000-000000000001'),'chat updates conversation preview');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000002','session_id','20000000-0000-4000-8000-000000000002','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select pg_temp.assert((select count(*)>=1 from public.communication_notifications where message_id='a2000000-0000-4000-8000-000000000001'),'chat notification fan-out works');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000001','session_id','20000000-0000-4000-8000-000000000001','exp',extract(epoch from now()+interval '1 hour'))::text,true);
insert into public.communication_reads(organization_id,conversation_id,user_id,last_read_at)
values('a783bd4c-f253-4a94-9365-75c6f1000001','a1000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',now());
insert into public.communication_reactions(organization_id,message_id,user_id,emoji)
values('a783bd4c-f253-4a94-9365-75c6f1000001','a2000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','✅');
update public.communication_messages set body='Edited security test message' where id='a2000000-0000-4000-8000-000000000001';
select pg_temp.assert((select edited_at is not null and body='Edited security test message' from public.communication_messages where id='a2000000-0000-4000-8000-000000000001'),'chat message editing is audited');
update public.communication_messages set deleted_at=now() where id='a2000000-0000-4000-8000-000000000001';
select pg_temp.assert((select deleted_at is not null and deleted_by=auth.uid() from public.communication_messages where id='a2000000-0000-4000-8000-000000000001'),'chat soft deletion preserves audit fields');
insert into public.communication_conversations(id,organization_id,title,kind,created_by)
values('a1000000-0000-4000-8000-000000000002','a783bd4c-f253-4a94-9365-75c6f1000001','Private security test','direta','10000000-0000-4000-8000-000000000001');
insert into public.communication_participants(organization_id,conversation_id,user_id)
values('a783bd4c-f253-4a94-9365-75c6f1000001','a1000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001'),('a783bd4c-f253-4a94-9365-75c6f1000001','a1000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002');
insert into public.communication_messages(organization_id,conversation_id,sender_id,body,client_message_id)
values('a783bd4c-f253-4a94-9365-75c6f1000001','a1000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','Private message',gen_random_uuid());
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000003','session_id','20000000-0000-4000-8000-000000000003','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select pg_temp.assert((select count(*)=0 from public.communication_messages where conversation_id='a1000000-0000-4000-8000-000000000002'),'direct chat is private to participants');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000001','session_id','20000000-0000-4000-8000-000000000001','exp',extract(epoch from now()+interval '1 hour'))::text,true);
insert into public.entries(id,organization_id,patient_id,kind,content) values('40000000-0000-4000-8000-000000000001','a783bd4c-f253-4a94-9365-75c6f1000001','30000000-0000-4000-8000-000000000001','atendimento','Fictional clinical content');
update public.entries set content='Updated fictional draft' where id='40000000-0000-4000-8000-000000000001';
select pg_temp.assert((select count(*)=2 from public.entry_versions),'draft history preserved');
update public.entries set status='finalizado' where id='40000000-0000-4000-8000-000000000001';
with changed as (update public.entries set content='erase history' where id='40000000-0000-4000-8000-000000000001' returning id)
select pg_temp.assert((select count(*)=0 from changed),'finalized entry update denied by RLS');
select pg_temp.denied($q$delete from public.entries$q$,'clinical deletion');
select pg_temp.denied($q$update public.audit_events set action='forged'$q$,'audit rewrite');
select pg_temp.denied($q$insert into public.audit_events(organization_id,action,entity_type) values('a783bd4c-f253-4a94-9365-75c6f1000001','forged','patients')$q$,'audit forgery');
select pg_temp.denied($q$insert into public.entries(organization_id,patient_id,kind) values('a783bd4c-f253-4a94-9365-75c6f1000001','30000000-0000-4000-8000-000000000002','anotacao')$q$,'cross-organization patient reference');
select pg_temp.denied($q$update public.patients set created_by='10000000-0000-4000-8000-000000000002'$q$,'author spoofing');
insert into public.entries(organization_id,patient_id,kind,amends_id,content) values('a783bd4c-f253-4a94-9365-75c6f1000001','30000000-0000-4000-8000-000000000001','anotacao','40000000-0000-4000-8000-000000000001','Fictional amendment');
select pg_temp.assert((select content='Updated fictional draft' from public.entries where id='40000000-0000-4000-8000-000000000001'),'amendment preserves original');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000003','session_id','20000000-0000-4000-8000-000000000003','exp',extract(epoch from now()+interval '1 hour'),'role','proprietario')::text,true);
select pg_temp.assert((select count(*)=1 from public.patients),'reception sees administrative patient data');
select pg_temp.assert((select count(*)=0 from public.entries),'reception denied clinical content despite spoofed frontend role');
select pg_temp.assert((select count(*)=0 from public.entry_versions),'reception denied draft history');
select pg_temp.assert((select count(*)=0 from public.documents),'reception denied document metadata');
select pg_temp.assert((select count(*)>=1 from public.procedures),'reception can read procedure catalogue');
select pg_temp.assert((select count(*)=0 from public.adverse_events),'reception denied adverse-event clinical content');
select pg_temp.assert((select count(*)=0 from storage.objects),'reception denied real seeded private files');
select pg_temp.denied($q$select public.convert_enquiry('70000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002')$q$,'conversion cannot target another clinic');
select pg_temp.denied($q$select public.convert_enquiry('70000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001')$q$,'obsolete enquiry conversion RPC is not callable by browser sessions');
select pg_temp.assert((select count(*)=0 from public.audit_events),'reception denied audit log');
select pg_temp.denied($q$insert into public.entries(organization_id,patient_id,kind) values('a783bd4c-f253-4a94-9365-75c6f1000001','30000000-0000-4000-8000-000000000001','anotacao')$q$,'reception clinical insert');
select pg_temp.denied($q$update public.memberships set role='proprietario'$q$,'self promotion');
select pg_temp.denied($q$insert into storage.objects(bucket_id,name) values('patient-files','arbitrary.html')$q$,'direct unsafe upload');
select pg_temp.denied($q$select public.consume_rate_limit('bypass',100000,1)$q$,'client bypass of intake limiter');
select pg_temp.denied($q$insert into public.enquiries(organization_id) values('a783bd4c-f253-4a94-9365-75c6f1000001')$q$,'direct enquiry submission');
select pg_temp.denied($q$insert into public.patients(organization_id,cpf) values('a783bd4c-f253-4a94-9365-75c6f1000001','11111111111')$q$,'invalid CPF checksum');
select pg_temp.denied($q$insert into public.patients(organization_id,cns) values('a783bd4c-f253-4a94-9365-75c6f1000001','100000000000000')$q$,'invalid CNS checksum');
insert into public.patients(organization_id,full_name,cpf,cns) values('a783bd4c-f253-4a94-9365-75c6f1000001','Fictional checksum test','52998224725','100000000000007');
select pg_temp.assert((select count(*)=2 from public.patients),'valid administrative patient insert works');
select pg_temp.denied($q$insert into public.patients(organization_id,cpf) values('a783bd4c-f253-4a94-9365-75c6f1000001','52998224725')$q$,'exact CPF duplicate prevented');
insert into public.patients(id,organization_id,full_name,created_by) values('30000000-0000-4000-8000-000000000003','a783bd4c-f253-4a94-9365-75c6f1000001','Fictional deletion test','10000000-0000-4000-8000-000000000003');
select public.delete_patient('30000000-0000-4000-8000-000000000003');
select pg_temp.assert((select count(*)=0 from public.patients where id='30000000-0000-4000-8000-000000000003'),'permanent deletion removes patient and dependent records');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000004','session_id','20000000-0000-4000-8000-000000000004','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select pg_temp.denied($q$insert into public.patients(organization_id,full_name) values('a783bd4c-f253-4a94-9365-75c6f1000001','No')$q$,'readonly cannot insert');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000005','session_id','20000000-0000-4000-8000-000000000005','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select pg_temp.assert((select count(*)=0 from public.patients),'disabled account loses access');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000001','session_id','20000000-0000-4000-8000-000000000001','exp',extract(epoch from now()-interval '1 hour'))::text,true);
select pg_temp.assert((select count(*)=0 from public.patients),'expired token denied');
select set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-000000000001','session_id','20000000-0000-4000-8000-000000000001','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select public.revoke_current_session();
select pg_temp.assert((select count(*)=0 from public.patients),'logout revocation rejects unexpired token');
set local role anon;
select set_config('request.jwt.claims','{}',true);
select pg_temp.denied('select * from public.patients','anonymous patient retrieval');
select pg_temp.denied('select * from public.entries','anonymous clinical retrieval');
select pg_temp.denied('select * from public.enquiries','anonymous enquiry retrieval');
select pg_temp.assert((select count(*)=0 from storage.objects),'anonymous storage denied');
select pg_temp.denied($q$select public.convert_enquiry(gen_random_uuid())$q$,'anonymous conversion');
rollback;
