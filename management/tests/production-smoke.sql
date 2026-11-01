-- Isolated fictional records; every write is rolled back. No real patient data.
begin;
do $$
declare
  qa_org uuid:=gen_random_uuid(); qa_user uuid:=gen_random_uuid(); qa_session uuid:=gen_random_uuid();
  qa_patient uuid:=gen_random_uuid(); qa_form uuid:=gen_random_uuid(); qa_procedure uuid:=gen_random_uuid(); qa_task uuid:=gen_random_uuid(); n integer;
  qa_followup uuid:=gen_random_uuid(); qa_booking uuid:=gen_random_uuid(); qa_appointment uuid; booking jsonb;
begin
  insert into auth.users(id,email) values(qa_user,qa_user::text||'@example.invalid');
  insert into auth.sessions(id,user_id) values(qa_session,qa_user);
  insert into public.organizations(id,name) values(qa_org,'QA rollback clinic');
  insert into public.memberships(organization_id,user_id,email,name,role,status) values(qa_org,qa_user,qa_user::text||'@example.invalid','QA rollback owner','proprietario','ativo');
  insert into public.public_intakes(id,organization_id,full_name,form_version,payload) values(qa_form,qa_org,'QA rollback registration','2026-10-30','{"lgpd_personal_data_consent":"yes","selected_procedures":[]}'::jsonb);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',qa_user,'session_id',qa_session,'role','authenticated','exp',extract(epoch from now()+interval '1 hour'))::text,true);
  set local role authenticated;
  if not private.has_role(qa_org,array['proprietario']) or private.has_role('a783bd4c-f253-4a94-9365-75c6f1000001',array['proprietario']) then raise exception 'QA role isolation failed'; end if;
  insert into public.patients(id,organization_id,full_name) values(qa_patient,qa_org,'QA rollback patient');
  update public.patients set preferred_name='QA edited' where id=qa_patient;
  if not exists(select 1 from public.patients where id=qa_patient and preferred_name='QA edited') then raise exception 'QA patient edit failed'; end if;
  insert into public.procedures(id,organization_id,name,category,description) values(qa_procedure,qa_org,'QA rollback procedure','outro','Fictional test only');
  update public.procedures set description='Edited fictional description',price_cents=12345 where id=qa_procedure;
  select count(*) into n from public.procedure_versions where procedure_id=qa_procedure;
  if n<>2 or not exists(select 1 from public.procedures where id=qa_procedure and price_cents=12345 and catalog_version=2) then raise exception 'QA catalogue save/version failed'; end if;
  insert into public.tasks(id,organization_id,patient_id,title) values(qa_task,qa_org,qa_patient,'QA rollback task');
  update public.tasks set status='concluida' where id=qa_task;
  if not exists(select 1 from public.tasks where id=qa_task and status='concluida') then raise exception 'QA task completion failed'; end if;
  update public.tasks set status='cancelado' where id=qa_task;
  insert into public.follow_ups(id,organization_id,patient_id,expected_on)
    values(qa_followup,qa_org,qa_patient,current_date);
  update public.tasks set source_type='follow_up',source_id=qa_followup,status='pendente' where id=qa_task;
  booking := jsonb_build_object('organization_id',qa_org,'patient_id',qa_patient,'starts_at','2026-12-01T12:00:00-03:00','ends_at','2026-12-01T13:00:00-03:00','label','QA rollback return');
  qa_appointment := public.save_appointment_series(booking,1,0,qa_followup,qa_booking);
  if qa_appointment is null or public.save_appointment_series(booking,1,0,qa_followup,qa_booking)<>qa_appointment then raise exception 'QA return booking retry failed'; end if;
  if not exists(select 1 from public.follow_ups where id=qa_followup and appointment_id=qa_appointment and status='agendado')
    or not exists(select 1 from public.tasks where id=qa_task and status='concluida') then raise exception 'QA return booking linkage failed'; end if;
  perform public.save_appointment_series(booking || jsonb_build_object('id',qa_appointment,'version',(select version from public.appointments where id=qa_appointment),'label','QA edited return'));
  if not exists(select 1 from public.appointments where id=qa_appointment and label='QA edited return') then raise exception 'QA appointment edit failed'; end if;
  if public.convert_public_intake(qa_form,qa_patient)<>qa_patient or public.convert_public_intake(qa_form,qa_patient)<>qa_patient then raise exception 'QA form linking failed'; end if;
  select count(*) into n from public.entries where data->>'intake_id'=qa_form::text;
  if n<>1 or not exists(select 1 from public.public_intakes where id=qa_form and status='convertido') then raise exception 'QA form duplicated or still active'; end if;
  perform public.delete_public_intake(qa_form);
  if exists(select 1 from public.public_intakes where id=qa_form) or not exists(select 1 from public.consents where patient_id=qa_patient and source_intake_id is null and status='aceito') then raise exception 'QA deletion/consent preservation failed'; end if;
  update public.procedures set active=false,review_status='arquivado' where id=qa_procedure;
  if not exists(select 1 from public.procedures where id=qa_procedure and not active and review_status='arquivado') then raise exception 'QA catalogue removal failed'; end if;
  perform public.revoke_current_session();
  if private.has_role(qa_org,array['proprietario']) then raise exception 'QA session revocation failed'; end if;
  reset role;
end $$;
rollback;
select true as passed,true as all_writes_rolled_back,'Role isolation, patient edit, catalogue create/edit/version/archive, task completion/dismissal, return booking/linkage/retry/edit, idempotent linking, deletion, consent preservation, session revocation' as checks;
