begin;
alter table public.public_intakes add column completed_at timestamptz;
alter table public.public_intakes add column request_id uuid unique;
alter table public.public_intakes add column upload_manifest jsonb;
-- Preserve all historical records; uncertain old uploads remain available to staff.
update public.public_intakes set completed_at=submitted_at where patient_id is not null or status<>'aguardando';
alter table public.public_intakes alter column completed_at set default now();
alter table public.public_intake_files add column sha256 text check(sha256 is null or sha256 ~ '^[a-f0-9]{64}$');

create function public.prepare_public_form(request uuid, row_data jsonb, manifest jsonb)
returns public.public_intakes language plpgsql security definer set search_path='' as $$
declare i public.public_intakes%rowtype;
begin
 if request is null or jsonb_typeof(manifest)<>'array' or jsonb_array_length(manifest)>10 then raise exception 'required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(request::text,0));
 select * into i from public.public_intakes where request_id=request;
 if i.id is not null then
  if i.payload<>row_data->'payload' or i.upload_manifest<>manifest then raise exception 'request_conflict'; end if;
  return i;
 end if;
 insert into public.public_intakes(organization_id,full_name,preferred_name,email,phone,cpf,selected_procedure,form_version,language,payload,status,completed_at,request_id,upload_manifest)
 values((row_data->>'organization_id')::uuid,row_data->>'full_name',row_data->>'preferred_name',row_data->>'email',row_data->>'phone',row_data->>'cpf',row_data->>'selected_procedure',row_data->>'form_version',row_data->>'language',row_data->'payload','aguardando',null,request,manifest) returning * into i;
 return i;
end $$;
revoke all on function public.prepare_public_form(uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.prepare_public_form(uuid,jsonb,jsonb) to service_role;

create or replace function private.queue_intake_notification() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.completed_at is not null and (new.upload_manifest is not null or (new.patient_id is not null and new.status='convertido')) then
  insert into public.intake_notification_outbox(intake_id) values(new.id) on conflict(intake_id) do nothing;
 end if;
 return new;
end $$;
drop trigger intake_notification_queue on public.public_intakes;
create trigger intake_notification_queue after insert or update of completed_at on public.public_intakes for each row execute function private.queue_intake_notification();

create function public.complete_public_form(enquiry uuid)
returns void language plpgsql security definer set search_path='' as $$
declare i public.public_intakes%rowtype; f jsonb; n integer:=0;
begin
 select * into i from public.public_intakes where id=enquiry for update;
 if i.id is null then raise exception 'intake_not_found'; end if;
 if i.completed_at is not null then return; end if;
 if i.upload_manifest is null then raise exception 'upload_session'; end if;
 for f in select value from jsonb_array_elements(i.upload_manifest) loop
  if not exists(select 1 from public.public_intake_files d where d.intake_id=i.id and d.path=i.organization_id::text||'/'||i.id::text||'/'||n::text and d.size_bytes=(f->>'size')::bigint and d.field_name=f->>'field' and (f->>'sha256' is null or d.sha256=f->>'sha256')) then raise exception 'upload'; end if;
  n:=n+1;
 end loop;
 if (select count(*) from public.public_intake_files where intake_id=i.id)<>n then raise exception 'file_record'; end if;
 update public.public_intakes set completed_at=now(),submitted_at=now(),status='novo' where id=i.id;
end $$;
revoke all on function public.complete_public_form(uuid) from public,anon,authenticated;
grant execute on function public.complete_public_form(uuid) to service_role;

alter table public.patient_health_history add column source_intake_id uuid references public.public_intakes(id) on delete set null;
create unique index health_source_intake_unique on public.patient_health_history(source_intake_id) where source_intake_id is not null;

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
-- Retire the old automatic creation path; historical patient links stay intact.
revoke all on function public.associate_completed_form(uuid) from service_role;

create or replace function private.sync_intake_consents()
returns trigger language plpgsql security definer set search_path='' as $$
declare
  actor uuid;
  field text;
  choice text;
  consent_kind text;
  accepted boolean;
  selected text;
begin
  if new.patient_id is null then return new; end if;
  select coalesce(new.converted_by, new.reviewed_by, m.user_id) into actor
    from public.memberships m where m.organization_id=new.organization_id
    and m.role='proprietario' and m.status='ativo' order by m.user_id limit 1;
  if actor is null then raise exception 'patient_author'; end if;
  for field, choice in select key, value from jsonb_each_text(new.payload) loop
    selected := null;
    consent_kind := case field
      when 'lgpd_personal_data_consent' then 'privacidade'
      when 'lgpd_sensitive_data_consent' then 'privacidade'
      when 'technical_image_authorisation' then 'fotografia_clinica'
      when 'marketing_image_authorisation' then 'publicacao_marketing'
      when 'promotional_communication' then 'comunicacao'
      when 'booking_fee_acknowledgement' then 'reserva'
      else case when field like 'accepted\_term\_%' escape '\' then 'procedimento' end end;
    if consent_kind is null then continue; end if;
    if consent_kind='procedimento' then
      selected := substr(field, length('accepted_term_')+1);
      if jsonb_typeof(new.payload->'selected_procedures') <> 'array'
        or not coalesce((new.payload->'selected_procedures') ? selected, false) then continue; end if;
    end if;
    accepted := choice='yes' or (field='marketing_image_authorisation' and choice in ('non_identifiable','partial_approval','full_approval'));
    if not accepted and choice <> 'no' then continue; end if;
    insert into public.consents(organization_id,patient_id,kind,template_version,status,method,accepted_at,created_by,language,source,source_intake_id,source_field,authorization_choice,patient_answers)
      values(new.organization_id,new.patient_id,consent_kind,new.form_version,
        case when accepted then 'aceito' else 'recusado' end,'formulario_publico',
        case when accepted then new.submitted_at end,actor,new.language,'formulario_publico',new.id,field,choice,
        jsonb_build_object('intake_id',new.id,'field',field,'choice',choice,'form_version',new.form_version,'procedure_key',selected,'signature_name',new.payload->'signature_name','signature_method',new.payload->'signature_method','completed_at',new.completed_at))
      on conflict (source_intake_id,source_field) where source_intake_id is not null do nothing;
  end loop;
  return new;
end $$;

create function private.preserve_completed_form() returns trigger language plpgsql set search_path='' as $$
begin
 if old.completed_at is not null and (new.payload is distinct from old.payload or new.upload_manifest is distinct from old.upload_manifest or new.request_id is distinct from old.request_id or new.completed_at is distinct from old.completed_at or new.submitted_at is distinct from old.submitted_at or new.form_version is distinct from old.form_version) then raise exception 'original_form_immutable'; end if;
 return new;
end $$;
create trigger preserve_completed_form before update on public.public_intakes for each row execute function private.preserve_completed_form();
commit;
