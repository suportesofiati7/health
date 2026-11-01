-- Fictional organization and records; all writes are rolled back.
begin;
do $$
declare org uuid:=gen_random_uuid(); actor uuid:=gen_random_uuid(); a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); p uuid; result jsonb;
begin
 insert into auth.users(id,email) values(actor,actor::text||'@example.invalid');
 insert into public.organizations(id,name) values(org,'QA intake rollback');
 insert into public.memberships(organization_id,user_id,name,email,role,status) values(org,actor,'QA owner',actor::text||'@example.invalid','proprietario','ativo');
 insert into public.public_intakes(id,organization_id,full_name,cpf,form_version,payload) values
 (a,org,'QA rollback A','52998224725','qa-v1','{"health_notes":"Fictional first declaration","birth_date":"1990-01-01"}'),
 (b,org,'QA rollback B','52998224725','qa-v2','{"health_notes":"Fictional second declaration","birth_date":"1990-01-01"}');
 result:=public.associate_completed_form(a);p:=(result->>'patient_id')::uuid;
 perform public.associate_completed_form(a);
 if (public.associate_completed_form(b)->>'patient_id')::uuid<>p then raise exception 'duplicate_patient'; end if;
 if (select count(*) from public.patients where organization_id=org)<>1 then raise exception 'patient_count'; end if;
 if (select count(*) from public.entries where organization_id=org)<>2 then raise exception 'duplicate_marker'; end if;
 if (select count(*) from public.intake_notification_outbox where intake_id in(a,b))<>2 then raise exception 'queue_count'; end if;
 if exists(select 1 from public.public_intakes where id in(a,b) and reviewed_at is not null) then raise exception 'incorrect_review'; end if;
 if (select payload->>'health_notes' from public.public_intakes where id=a)<>'Fictional first declaration' then raise exception 'overwritten_history'; end if;
end $$;
rollback;
select true as passed,true as all_writes_rolled_back,'Atomic association, repeat CPF, historical payload, one marker and notification per submission, no automatic professional review' as checks;
