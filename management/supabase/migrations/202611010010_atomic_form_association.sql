begin;
-- The intake row lock serializes completion retries. A CPF advisory lock also
-- serializes different submissions arriving for the same patient concurrently.
create function public.associate_completed_form(enquiry uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare i public.public_intakes%rowtype; p uuid; actor uuid; cpf_value text; linked_status text := 'linked';
begin
 select * into i from public.public_intakes where id=enquiry for update;
 if i.id is null then raise exception 'intake_not_found'; end if;
 if i.patient_id is not null then return jsonb_build_object('patient_id',i.patient_id,'status','linked'); end if;
 cpf_value := regexp_replace(i.cpf,'[^0-9]','','g');
 if length(cpf_value)<>11 then raise exception 'cpf'; end if;
 perform pg_advisory_xact_lock(hashtextextended(i.organization_id::text||':'||cpf_value,0));
 select id into p from public.patients where organization_id=i.organization_id and cpf=cpf_value;
 select user_id into actor from public.memberships where organization_id=i.organization_id and role='proprietario' and status='ativo' order by user_id limit 1;
 if actor is null then raise exception 'patient_author'; end if;
 if p is null then
  insert into public.patients(organization_id,full_name,preferred_name,birth_date,cpf,rg,phone,email,address,guardian,status,created_by)
  values(i.organization_id,i.full_name,i.preferred_name,nullif(i.payload->>'birth_date','')::date,cpf_value,
   concat_ws(' · ',nullif(i.payload->>'identity_document',''),nullif(i.payload->>'identity_issuer',''),nullif(i.payload->>'identity_letter','')),
   regexp_replace(coalesce(i.phone,''),'[^0-9]','','g'),i.email,
   jsonb_build_object('raw',coalesce(i.payload->>'address',''),'postal_code',coalesce(i.payload->>'postal_code','')),
   jsonb_build_object('raw',coalesce(i.payload->>'guardian_details','')),'ativo',actor) returning id into p;
  linked_status := 'created';
 end if;
 update public.public_intakes set patient_id=p,status='convertido',converted_by=actor,converted_at=now() where id=i.id;
 insert into public.entries(organization_id,patient_id,kind,title,content,data,status,created_by)
 values(i.organization_id,p,'consentimento','Formulário público '||i.form_version,'Declarações e consentimentos enviados pelo paciente, sem revisão profissional automática.',jsonb_build_object('intake_id',i.id,'form_version',i.form_version,'language',i.language),'finalizado',actor);
 return jsonb_build_object('patient_id',p,'status',linked_status);
end $$;
revoke all on function public.associate_completed_form(uuid) from public,anon,authenticated;
grant execute on function public.associate_completed_form(uuid) to service_role;
commit;
