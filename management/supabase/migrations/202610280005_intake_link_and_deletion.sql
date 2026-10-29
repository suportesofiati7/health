begin;
-- Preserve patient consent evidence when the source form is explicitly deleted.
-- The consent stores the original choice and form version independently.
alter table public.consents drop constraint if exists consents_source_intake_id_fkey;
alter table public.consents add constraint consents_source_intake_id_fkey
  foreign key (source_intake_id) references public.public_intakes(id) on delete set null;

create or replace function public.convert_public_intake(enquiry uuid, existing_patient uuid default null)
returns uuid language plpgsql security definer set search_path='' as $fn$
declare i public.public_intakes%rowtype; p uuid;
begin
  select * into i from public.public_intakes where id=enquiry for update;
  if i.id is null or not private.has_role(i.organization_id,array['proprietario','profissional','recepcao']) then raise exception 'not_authorized'; end if;
  if i.patient_id is not null then
    if existing_patient is not null and existing_patient <> i.patient_id then raise exception 'intake_already_linked'; end if;
    return i.patient_id;
  end if;
  if existing_patient is not null then
    select id into p from public.patients where id=existing_patient and organization_id=i.organization_id;
    if p is null then raise exception 'invalid_patient'; end if;
  else
    insert into public.patients(organization_id,full_name,preferred_name,birth_date,cpf,rg,phone,email,address,guardian,status)
    values (i.organization_id,i.full_name,i.preferred_name,nullif(i.payload->>'birth_date','')::date,
      regexp_replace(i.cpf,'[^0-9]','','g'),coalesce(i.payload->>'identity_document',''),
      regexp_replace(coalesce(i.phone,''),'[^0-9]','','g'),i.email,
      jsonb_build_object('raw',coalesce(i.payload->>'address','')),
      jsonb_build_object('raw',coalesce(i.payload->>'guardian_details','')),'ativo') returning id into p;
  end if;
  update public.public_intakes set patient_id=p,status='convertido',converted_by=auth.uid(),converted_at=now(),reviewed_by=coalesce(reviewed_by,auth.uid()),reviewed_at=coalesce(reviewed_at,now()) where id=i.id;
  insert into public.entries(organization_id,patient_id,kind,title,content,data,status)
  values(i.organization_id,p,'consentimento','Formulário público '||i.form_version,'Registro original do formulário público e dos consentimentos aceitos.',jsonb_build_object('intake_id',i.id,'form_version',i.form_version,'language',i.language,'payload',i.payload),'finalizado');
  return p;
end $fn$;
revoke all on function public.convert_public_intake(uuid,uuid) from public,anon;
grant execute on function public.convert_public_intake(uuid,uuid) to authenticated;


-- The consolidated assessment also survives deletion of its source registration.
alter table public.master_intakes drop constraint if exists master_intakes_source_intake_id_fkey;
alter table public.master_intakes add constraint master_intakes_source_intake_id_fkey
  foreign key (source_intake_id) references public.public_intakes(id) on delete set null;

commit;
