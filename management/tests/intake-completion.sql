-- Local/rollback fixture only. No real patient data or storage mutations.
\set ON_ERROR_STOP on
begin;
create function pg_temp.check_true(ok boolean, message text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception '%',message; end if; end$$;
do $$
declare o uuid:=gen_random_uuid(); u uuid:=gen_random_uuid(); sess uuid:=gen_random_uuid(); req uuid:=gen_random_uuid(); a public.public_intakes%rowtype; b public.public_intakes%rowtype; p uuid; row_data jsonb;
begin
 insert into auth.users(id,email) values(u,u::text||'@example.invalid');
 insert into auth.sessions(id,user_id) values(sess,u);
 insert into public.organizations(id,name) values(o,'QA completion rollback');
 insert into public.memberships(organization_id,user_id,name,email,role,status) values(o,u,'QA reviewer',u::text||'@example.invalid','proprietario','ativo');
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'session_id',sess,'exp',extract(epoch from now()+interval '1 hour'))::text,true);
 row_data:=jsonb_build_object('organization_id',o,'full_name','QA fictício','preferred_name','','email','','phone','','cpf','52998224725','form_version','qa','language','pt-BR','selected_procedure','toxina','payload',jsonb_build_object('health_notes','Declaração não diagnosticada','promotional_communication','no','technical_image_authorisation','no'));
 a:=public.prepare_public_form(req,row_data,'[]');
 b:=public.prepare_public_form(req,row_data,'[]');
 perform pg_temp.check_true(a.id=b.id,'prepare duplicated the request');
 perform pg_temp.check_true(a.completed_at is null and a.patient_id is null,'prepare completed or converted the form');
 perform pg_temp.check_true(not exists(select 1 from public.intake_notification_outbox where intake_id=a.id),'prepare queued mail prematurely');
 begin perform public.convert_public_intake(a.id); raise exception 'unexpected incomplete conversion'; exception when others then if sqlerrm<>'intake_incomplete' then raise; end if; end;
 begin perform public.prepare_public_form(req,jsonb_set(row_data,'{payload}','{"different":true}'),'[]'); raise exception 'unexpected conflicting retry'; exception when others then if sqlerrm<>'request_conflict' then raise; end if; end;
 perform public.complete_public_form(a.id); perform public.complete_public_form(a.id);
 perform pg_temp.check_true((select count(*)=1 from public.intake_notification_outbox where intake_id=a.id),'completion did not queue exactly once');
 perform pg_temp.check_true((select patient_id is null and reviewed_at is null and status='novo' from public.public_intakes where id=a.id),'completion auto-reviewed or auto-converted');
 p:=public.convert_public_intake(a.id);
 perform pg_temp.check_true(public.convert_public_intake(a.id)=p,'conversion is not idempotent');
 perform pg_temp.check_true((select count(*)=1 from public.patient_health_history where source_intake_id=a.id and allergies='' and medications='' and conditions='' and other_notes='Declaração não diagnosticada'),'health declaration missing or inferred');
 perform pg_temp.check_true((select count(*)=1 from public.consents where source_intake_id=a.id and source_field='technical_image_authorisation' and status='recusado'),'explicit refusal missing');
 b:=public.prepare_public_form(gen_random_uuid(),row_data,'[]');perform public.complete_public_form(b.id);
 begin perform public.convert_public_intake(b.id); raise exception 'unexpected duplicate creation'; exception when others then if sqlerrm<>'patient_exists' then raise; end if; end;
 perform pg_temp.check_true(public.convert_public_intake(b.id,p)=p,'explicit link failed');
 perform pg_temp.check_true((select count(*)=1 from public.patients where organization_id=o),'duplicate patient');
 perform pg_temp.check_true((select count(*)=2 from public.patient_health_history where patient_id=p),'existing declaration overwritten');
 begin update public.public_intakes set payload='{}' where id=a.id; raise exception 'unexpected mutable original'; exception when others then if sqlerrm<>'original_form_immutable' then raise; end if; end;
 perform pg_temp.check_true(not has_function_privilege('anon','public.complete_public_form(uuid)','execute'),'anonymous completion RPC granted');
 perform pg_temp.check_true(not has_function_privilege('authenticated','public.prepare_public_form(uuid,jsonb,jsonb)','execute'),'staff prepare RPC granted');
 perform pg_temp.check_true(not has_function_privilege('service_role','public.associate_completed_form(uuid)','execute'),'automatic association still callable by service');
end$$;
rollback;
select true as passed, 'request retry/conflict, completion queue, review-first conversion, explicit same-CPF linking, health/consent history and immutable evidence' as checks;
