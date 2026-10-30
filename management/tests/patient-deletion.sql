-- Fictional fixture only; safe against a deployed project because it rolls back.
begin;
do $$
declare
  u uuid:=gen_random_uuid(); s uuid:=gen_random_uuid(); p uuid:=gen_random_uuid();
  o uuid:=gen_random_uuid(); proc uuid:=gen_random_uuid(); e uuid:=gen_random_uuid();
  intake uuid:=gen_random_uuid(); converted uuid; catalog uuid:=gen_random_uuid(); product uuid:=gen_random_uuid(); movement uuid:=gen_random_uuid();
begin
  insert into auth.users(id) values(u);
  insert into auth.sessions(id,user_id) values(s,u);
  insert into public.organizations(id,name) values(o,'QA deletion rollback');
  insert into public.memberships(organization_id,user_id,name,email,role,status)
    values(o,u,'QA deletion',u::text||'@example.invalid','proprietario','ativo');
  perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'session_id',s,'role','authenticated','exp',extract(epoch from now()+interval '1 hour'))::text,true);
  insert into public.patients(id,organization_id,full_name,created_by) values(p,o,'QA deletion rollback',u);
  insert into public.entries(id,organization_id,patient_id,kind,status,created_by) values(e,o,p,'anotacao','finalizado',u);
  insert into public.entries(organization_id,patient_id,kind,parent_id,amends_id,status,created_by) values(o,p,'anotacao',e,e,'finalizado',u);
  insert into public.procedures(id,organization_id,name,category,created_by) values(catalog,o,'QA procedure','outro',u);
  insert into public.clinical_procedures(id,organization_id,patient_id,procedure_id,professional_id,created_by) values(proc,o,p,catalog,u,u);
  insert into public.follow_ups(organization_id,patient_id,clinical_procedure_id,expected_on,created_by) values(o,p,proc,current_date,u);
  insert into public.adverse_events(organization_id,patient_id,clinical_procedure_id,created_by) values(o,p,proc,u);
  insert into public.waitlist_entries(organization_id,patient_id,created_by) values(o,p,u);
  insert into public.patient_portal_actions(organization_id,patient_id,clinical_procedure_id,action_type) values(o,p,proc,'solicitar_retorno');
  insert into public.products(id,organization_id,name,created_by) values(product,o,'QA stock',u);
  insert into public.inventory_movements(id,organization_id,product_id,clinical_procedure_id,movement_type,quantity,created_by) values(movement,o,product,proc,'consumo',1,u);
  set local role authenticated;
  perform public.delete_patient(p);
  reset role;
  insert into public.public_intakes(id,organization_id,full_name,cpf,phone,email,form_version,payload)
    values(intake,o,'QA manual conversion','','43999990000','qa@example.invalid','QA',
      jsonb_build_object('birth_date','1990-01-01','identity_document','QA123','identity_issuer','QA','identity_letter','PR',
        'address','QA address','postal_code','86000-000','guardian_details','QA guardian','health_notes',repeat('x',120000)));
  set local role authenticated;
  converted:=public.convert_public_intake(intake);
  if not exists(select 1 from public.patients where id=converted and birth_date='1990-01-01' and rg='QA123 · QA · PR' and address->>'postal_code'='86000-000')
    or not exists(select 1 from public.public_intakes where id=intake and length(payload->>'health_notes')=120000)
    then raise exception 'manual conversion lost submitted data'; end if;
  if public.convert_public_intake(intake)<>converted or (select count(*) from public.entries where patient_id=converted)<>1
    then raise exception 'manual conversion is not idempotent'; end if;
  perform public.delete_patient(converted);
  if exists(select 1 from public.patients where id=p) or exists(select 1 from public.entry_versions where patient_id=p)
    or exists(select 1 from public.waitlist_entries where patient_id=p) or exists(select 1 from public.patient_portal_actions where patient_id=p)
    then raise exception 'patient deletion left dependent records'; end if;
  if not exists(select 1 from public.inventory_movements where id=movement and clinical_procedure_id is null) then raise exception 'stock accounting was lost'; end if;
  reset role;
end $$;
rollback;
select 'PASS: deletion with finalized entries, amendments, follow-ups, adverse events, waitlist, portal actions and inventory; idempotent manual conversion with complete identity and 120KB answers; all writes rolled back' as result;
