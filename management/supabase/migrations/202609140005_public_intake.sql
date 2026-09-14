begin;

-- Public submissions are intentionally separate from patients.  The table is
-- never granted to anon; only the intake Edge Function (service role) writes it.
create table public.public_intakes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  full_name text not null check (length(full_name) between 1 and 200),
  preferred_name text not null default '',
  email text not null default '' check (length(email) <= 254),
  phone text not null default '',
  cpf text not null default '',
  selected_procedure text not null default '',
  status text not null default 'novo' check (status in ('novo','em_analise','contatado','aguardando','convertido','arquivado')),
  form_version text not null,
  language text not null default 'pt-BR',
  submitted_at timestamptz not null default now(),
  retention_expires_at timestamptz not null default (now() + interval '60 days'),
  retention_hold boolean not null default false,
  patient_id uuid,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  converted_by uuid references auth.users(id),
  converted_at timestamptz,
  internal_notes text not null default '',
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 500000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, patient_id) references public.patients(organization_id, id)
);
create index public_intakes_queue on public.public_intakes(organization_id,status,submitted_at desc);
create index public_intakes_retention on public.public_intakes(retention_expires_at) where patient_id is null and retention_hold = false;

create table public.public_intake_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  intake_id uuid not null references public.public_intakes(id) on delete cascade,
  kind text not null check (kind in ('identity','payment')),
  bucket text not null default 'intake-private',
  path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now()
);
create index public_intake_files_intake on public.public_intake_files(intake_id);

alter table public.public_intakes enable row level security;
alter table public.public_intake_files enable row level security;
revoke all on public.public_intakes, public.public_intake_files from anon, authenticated;
grant select on public.public_intakes, public.public_intake_files to authenticated;
grant update(status,internal_notes,retention_hold,reviewed_by,reviewed_at) on public.public_intakes to authenticated;

create policy intake_read on public.public_intakes for select to authenticated
  using (private.has_role(organization_id,array['proprietario','profissional','recepcao']));
create policy intake_update on public.public_intakes for update to authenticated
  using (private.has_role(organization_id,array['proprietario','profissional','recepcao']))
  with check (private.has_role(organization_id,array['proprietario','profissional','recepcao']));
create policy intake_files_read on public.public_intake_files for select to authenticated
  using (private.has_role(organization_id,array['proprietario','profissional','recepcao']));

create or replace function private.public_intake_touch() returns trigger
language plpgsql set search_path='' as $$
begin new.updated_at := now(); return new; end $$;
create trigger public_intake_touch before update on public.public_intakes
for each row execute function private.public_intake_touch();

create trigger audit_public_intake after insert or update on public.public_intakes
for each row execute function private.audit_change();

create or replace function public.convert_public_intake(enquiry uuid, existing_patient uuid default null)
returns uuid language plpgsql security definer set search_path='' as $fn$
declare i public.public_intakes%rowtype; p uuid;
begin
  select * into i from public.public_intakes where id=enquiry for update;
  if i.id is null or not private.has_role(i.organization_id,array['proprietario','profissional','recepcao']) then raise exception 'not_authorized'; end if;
  if i.patient_id is not null then raise exception 'invalid_intake'; end if;
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

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('intake-private','intake-private',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy intake_file_read on storage.objects for select to authenticated
  using (bucket_id='intake-private' and exists (
    select 1 from public.public_intake_files f
    where f.path = storage.objects.name
      and private.has_role(f.organization_id,array['proprietario','profissional','recepcao'])
  ));

-- Safe cleanup is database-side and does not depend on a browser being open.
create or replace function private.cleanup_expired_public_intakes()
returns integer language plpgsql security definer set search_path='' as $$
declare r record; n integer := 0;
begin
  for r in
    select id from public.public_intakes
    where patient_id is null and retention_hold = false and retention_expires_at <= now()
    for update skip locked
  loop
    insert into public.audit_events(organization_id,actor_id,action,entity_type,entity_id)
      select organization_id,null,'retention_cleanup','public_intake',id from public.public_intakes where id=r.id;
    delete from storage.objects where bucket_id='intake-private'
      and name like (select organization_id::text||'/'||id::text||'/%' from public.public_intakes where id=r.id);
    delete from public.public_intakes where id = r.id;
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function private.cleanup_expired_public_intakes() from public,anon,authenticated;
grant execute on function private.cleanup_expired_public_intakes() to service_role;

-- Supabase exposes pg_cron on the free architecture. If it is unavailable in a
-- local validator, the migration remains usable through the same function.
do $cron$ begin
  create extension if not exists pg_cron with schema extensions;
  perform cron.schedule('sofiati-public-intake-retention', '15 3 * * *', $job$select private.cleanup_expired_public_intakes()$job$);
exception when others then
  null;
end $cron$;

commit;
