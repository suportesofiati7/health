begin;

create or replace function public.convert_public_intake(enquiry uuid, existing_patient uuid default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare i public.public_intakes%rowtype; p uuid; same_cpf uuid; normalized_cpf text;
begin
 select * into i from public.public_intakes where id=enquiry for update;
 if i.id is null or not private.has_permission(i.organization_id,'intake_forms','edit') then raise exception 'not_authorized'; end if;
 if i.patient_id is not null then
  if existing_patient is not null and existing_patient<>i.patient_id then raise exception 'intake_already_linked'; end if;
  return i.patient_id;
 end if;
 if i.completed_at is null then raise exception 'intake_incomplete'; end if;
 normalized_cpf:=nullif(regexp_replace(i.cpf,'[^0-9]','','g'),'');
 -- Preserve unverified values in the source form, not the canonical patient CPF.
 if not private.valid_cpf(normalized_cpf) then normalized_cpf:=null; end if;
 if normalized_cpf is not null then
  perform pg_advisory_xact_lock(hashtextextended(i.organization_id::text||':'||normalized_cpf,0));
  select id into same_cpf from public.patients where organization_id=i.organization_id and cpf=normalized_cpf;
 end if;
 if existing_patient is not null then
  select id into p from public.patients where id=existing_patient and organization_id=i.organization_id;
  if p is null then raise exception 'invalid_patient'; end if;
  if same_cpf is not null and same_cpf<>p then raise exception 'identity_conflict'; end if;
 elsif same_cpf is not null then
  -- Require the reviewer to explicitly select the matching existing patient.
  raise exception 'patient_exists';
 else
  insert into public.patients(organization_id,full_name,preferred_name,birth_date,cpf,rg,phone,email,address,guardian,status)
  values(i.organization_id,i.full_name,i.preferred_name,nullif(i.payload->>'birth_date','')::date,normalized_cpf,
   concat_ws(' · ',nullif(i.payload->>'identity_document',''),nullif(i.payload->>'identity_issuer',''),nullif(i.payload->>'identity_letter','')),
   regexp_replace(coalesce(i.phone,''),'[^0-9]','','g'),i.email,jsonb_build_object('raw',coalesce(i.payload->>'address',''),'postal_code',coalesce(i.payload->>'postal_code','')),
   jsonb_build_object('raw',coalesce(i.payload->>'guardian_details','')),'ativo') returning id into p;
 end if;
 if nullif(i.payload->>'health_notes','') is not null then
  insert into public.patient_health_history(organization_id,patient_id,other_notes,source_intake_id)
  values(i.organization_id,p,i.payload->>'health_notes',i.id) on conflict(source_intake_id) where source_intake_id is not null do nothing;
 end if;
 insert into public.communication_preferences(organization_id,patient_id,relationship_allowed,notes)
 values(i.organization_id,p,coalesce(i.payload->>'promotional_communication'='yes',false),'Preferência declarada no formulário '||i.id::text)
 on conflict(organization_id,patient_id) do update set relationship_allowed=case when i.payload->>'promotional_communication'='no' then false else public.communication_preferences.relationship_allowed end;
 update public.public_intakes set patient_id=p,status='convertido',converted_by=auth.uid(),converted_at=now(),reviewed_by=coalesce(reviewed_by,auth.uid()),reviewed_at=coalesce(reviewed_at,now()) where id=i.id;
 insert into public.entries(organization_id,patient_id,kind,title,content,data,status)
 values(i.organization_id,p,'consentimento','Formulário público '||i.form_version,'Declarações, consentimentos e documentos originais do paciente. Informações sujeitas à confirmação profissional.',jsonb_build_object('intake_id',i.id,'form_version',i.form_version,'language',i.language),'finalizado');
 return p;
end $$;

commit;
