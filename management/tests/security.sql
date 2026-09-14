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
select pg_temp.assert((select count(*)=1 from public.patients),'owner sees only own organization');
select pg_temp.assert((select count(*)=1 from storage.objects),'owner reads own private file only');
select pg_temp.assert((select count(*)=0 from storage.objects where name='clinic2/other.pdf'),'guessing another clinic file path fails');
insert into public.procedures(organization_id,name,category,created_by) values('a783bd4c-f253-4a94-9365-75c6f1000001','Procedimento fictício E2E','teste','10000000-0000-4000-8000-000000000001');
insert into public.follow_ups(organization_id,patient_id,expected_on,created_by) values('a783bd4c-f253-4a94-9365-75c6f1000001','30000000-0000-4000-8000-000000000001',current_date,'10000000-0000-4000-8000-000000000001');
select pg_temp.assert((select count(*)=1 from public.procedures where name='Procedimento fictício E2E'),'owner can configure a fictional procedure');
select pg_temp.assert((select count(*)=1 from public.follow_ups),'owner can create a fictional follow-up');
select pg_temp.denied($q$insert into public.procedures(organization_id,name) values('a783bd4c-f253-4a94-9365-75c6f1000002','Other clinic procedure')$q$,'cross-organization procedure');
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
select pg_temp.assert(public.convert_enquiry('70000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001')='30000000-0000-4000-8000-000000000001','reception converts enquiry to existing patient');
select pg_temp.assert(public.convert_enquiry('70000000-0000-4000-8000-000000000001',null)='30000000-0000-4000-8000-000000000001','repeated conversion does not duplicate patients');
select pg_temp.denied($q$update public.enquiries set status='novo' where id='70000000-0000-4000-8000-000000000001'$q$,'converted enquiry cannot be silently unlinked');
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
