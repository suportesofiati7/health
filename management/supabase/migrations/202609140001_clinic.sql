begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create extension if not exists pg_trgm with schema extensions;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
insert into public.organizations(id,name) values
('a783bd4c-f253-4a94-9365-75c6f1000001','Franciele Sofiati');

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id),
  name text not null default '', email text not null,
  role text not null check(role in ('proprietario','profissional','recepcao','leitura')),
  status text not null default 'convidado' check(status in ('convidado','ativo','inativo','suspenso')),
  profession text not null default '', council text not null default '',
  registration text not null default '', state text not null default '', specialty text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(organization_id,user_id), unique(organization_id,email)
);
create table private.revoked_sessions(id uuid primary key, expires_at timestamptz not null);

create function private.has_role(org uuid, roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.memberships m
    join auth.sessions s on s.user_id=m.user_id
    where m.organization_id=org and m.user_id=auth.uid()
    and m.status='ativo' and m.role=any(roles)
    and s.id::text=auth.jwt()->>'session_id'
    and not exists(select 1 from private.revoked_sessions r where r.id=s.id)
    and coalesce((auth.jwt()->>'exp')::numeric,0)>extract(epoch from now()))
$$;
grant usage on schema private to authenticated, service_role;
grant execute on function private.has_role(uuid,text[]) to authenticated;

create function public.revoke_current_session() returns void
language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'not_authorized'; end if;
  insert into private.revoked_sessions(id,expires_at)
  values ((auth.jwt()->>'session_id')::uuid,now()+interval '1 day') on conflict do nothing;
end $$;

create function private.valid_cpf(value text) returns boolean
language plpgsql immutable set search_path='' as $$
declare s integer; d integer; i integer;
begin
  if value is null then return true; end if;
  if value !~ '^[0-9]{11}$' or value ~ '^([0-9])\1{10}$' then return false; end if;
  for d in 10..11 loop
    s:=0;
    for i in 1..d-1 loop s:=s+substring(value,i,1)::int*(d+1-i); end loop;
    s:=(s*10)%11; if s=10 then s:=0; end if;
    if s<>substring(value,d,1)::int then return false; end if;
  end loop;
  return true;
end $$;

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  full_name text not null default '' check(length(full_name)<=200),
  preferred_name text not null default '', birth_date date,
  cpf text check(private.valid_cpf(cpf)), rg text not null default '',
  cns text check(cns is null or cns ~ '^[0-9]{15}$'),
  phone text not null default '' check(phone='' or phone ~ '^[0-9]{10,13}$'),
  email text not null default '' check(length(email)<=254),
  address jsonb not null default '{}' check(jsonb_typeof(address)='object'),
  emergency_contact jsonb not null default '{}' check(jsonb_typeof(emergency_contact)='object'),
  guardian jsonb not null default '{}' check(jsonb_typeof(guardian)='object'),
  occupation text not null default '', insurance text not null default '',
  status text not null default 'ativo' check(status in ('ativo','inativo')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique(organization_id,id), unique(organization_id,cpf)
);
create index patients_search on public.patients using gin(full_name extensions.gin_trgm_ops);
create index patients_org_created on public.patients(organization_id,created_at desc);
create index patients_phone on public.patients(organization_id,phone);
create index patients_email on public.patients(organization_id,email);

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null, patient_id uuid not null,
  kind text not null check(kind in ('avaliacao','anamnese','plano','atendimento','evolucao','anotacao','consentimento','alerta')),
  title text not null default '' check(length(title)<=300),
  content text not null default '' check(length(content)<=100000),
  data jsonb not null default '{}' check(jsonb_typeof(data)='object' and octet_length(data::text)<=100000),
  clinical_at timestamptz not null default now(),
  status text not null default 'rascunho' check(status in ('rascunho','finalizado')),
  parent_id uuid, amends_id uuid, pinned boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  finalized_at timestamptz, version integer not null default 1,
  unique(organization_id,patient_id,id),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id),
  foreign key(organization_id,patient_id,parent_id) references public.entries(organization_id,patient_id,id),
  foreign key(organization_id,patient_id,amends_id) references public.entries(organization_id,patient_id,id)
);
create index entries_patient_time on public.entries(organization_id,patient_id,clinical_at desc);
create table public.entry_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null, patient_id uuid not null, entry_id uuid not null,
  version integer not null, snapshot jsonb not null,
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
  foreign key(organization_id,patient_id,entry_id) references public.entries(organization_id,patient_id,id),
  unique(entry_id,version)
);
create table public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null, patient_id uuid not null,
  content text not null default '' check(length(content)<=10000),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id)
);
create table public.appointments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null,
  patient_id uuid not null, professional_id uuid,
  starts_at timestamptz not null, ends_at timestamptz not null,
  status text not null default 'agendado' check(status in
    ('agendado','confirmado','aguardando','em_atendimento','concluido','cancelado','faltou','reagendado')),
  label text not null default '',
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), version integer not null default 1,
  foreign key(organization_id,patient_id) references public.patients(organization_id,id),
  foreign key(organization_id,professional_id) references public.memberships(organization_id,user_id),
  check(ends_at>starts_at and ends_at<=starts_at+interval '12 hours')
);
create index appointments_time on public.appointments(organization_id,starts_at);
create table public.tasks (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null,
  patient_id uuid, assigned_to uuid, title text not null default '',
  due_at timestamptz not null default now(),
  priority text not null default 'normal' check(priority in ('normal','alta')),
  status text not null default 'pendente' check(status in ('pendente','concluida','cancelado')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), version integer not null default 1,
  foreign key(organization_id,patient_id) references public.patients(organization_id,id),
  foreign key(organization_id,assigned_to) references public.memberships(organization_id,user_id)
);
create index tasks_due on public.tasks(organization_id,status,due_at);
create table public.enquiries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
  full_name text not null default '' check(length(full_name)<=200),
  phone text not null default '' check(length(phone)<=13), email text not null default '' check(length(email)<=254),
  preferred_contact text not null default 'whatsapp' check(preferred_contact in ('whatsapp','phone','email')),
  privacy_version text not null default '2026-09-14', consent_at timestamptz not null default now(),
  status text not null default 'novo' check(status in ('novo','em_analise','contatado','convertido','encerrado')),
  internal_notes text not null default '' check(length(internal_notes)<=10000),
  patient_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), version integer not null default 1,
  foreign key(organization_id,patient_id) references public.patients(organization_id,id)
);
create index enquiries_time on public.enquiries(organization_id,created_at desc);

create table public.documents (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, patient_id uuid not null,
  name text not null check(length(name)<=200), category text not null default 'documento', description text not null default '',
  path text not null unique, mime_type text not null check(mime_type in ('application/pdf','image/jpeg','image/png','image/webp')),
  size_bytes bigint not null check(size_bytes between 1 and 8388608), sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
  status text not null default 'pendente' check(status in ('pendente','pronto','falha')),
  created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(),
  unique(organization_id,patient_id,id), unique(organization_id,patient_id,sha256),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id)
);
create index documents_patient on public.documents(organization_id,patient_id,created_at desc);
create table public.document_links (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, patient_id uuid not null,
  document_id uuid not null, entry_id uuid not null,
  created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(),
  foreign key(organization_id,patient_id,document_id) references public.documents(organization_id,patient_id,id),
  foreign key(organization_id,patient_id,entry_id) references public.entries(organization_id,patient_id,id),
  unique(document_id,entry_id)
);
create table public.communications (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, patient_id uuid not null,
  recipient text not null default 'suportesofiati@gmail.com' check(recipient='suportesofiati@gmail.com'),
  status text not null default 'pendente' check(status in ('pendente','aceito','falha','nao_confirmado')),
  packet_sha256 text not null, created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id)
);
create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id),
  actor_id uuid references auth.users(id), action text not null,
  entity_type text not null, entity_id uuid, created_at timestamptz not null default now()
);
create index audit_org_time on public.audit_events(organization_id,created_at desc);
create table private.rate_limits (key text primary key, window_start timestamptz not null, hits integer not null);

create function private.stamp() returns trigger language plpgsql set search_path='' as $$
begin
  if TG_OP='UPDATE' then
    if new.organization_id<>old.organization_id or new.id<>old.id then raise exception 'immutable_identity'; end if;
    if to_jsonb(old) ? 'created_by' and new.created_by<>old.created_by then raise exception 'immutable_author'; end if;
    if new.created_at<>old.created_at then raise exception 'immutable_timestamp'; end if;
    new.updated_at:=now(); new.version:=old.version+1;
  else
    if auth.uid() is not null then new.created_by:=auth.uid(); end if;
    new.created_at:=now(); new.updated_at:=now(); new.version:=1;
  end if;
  return new;
end $$;
create trigger patients_stamp before insert or update on public.patients for each row execute function private.stamp();
create trigger appointments_stamp before insert or update on public.appointments for each row execute function private.stamp();
create trigger tasks_stamp before insert or update on public.tasks for each row execute function private.stamp();

create function private.entry_guard() returns trigger language plpgsql set search_path='' as $$
begin
  if TG_OP='UPDATE' then
    if old.status='finalizado' then raise exception 'final_record_is_immutable'; end if;
    if new.id<>old.id or new.organization_id<>old.organization_id or new.patient_id<>old.patient_id
       or new.created_by<>old.created_by or new.created_at<>old.created_at
       or new.kind<>old.kind or new.amends_id is distinct from old.amends_id then raise exception 'immutable_identity'; end if;
    new.version:=old.version+1;
  else
    if auth.uid() is not null then new.created_by:=auth.uid(); end if;
    new.created_at:=now(); new.version:=1;
    if new.amends_id is not null and not exists(select 1 from public.entries
      where id=new.amends_id and patient_id=new.patient_id and organization_id=new.organization_id and status='finalizado')
    then raise exception 'invalid_amendment'; end if;
  end if;
  new.updated_at:=now();
  new.finalized_at:=case when new.status='finalizado' then now() else null end;
  return new;
end $$;
create trigger entries_guard before insert or update on public.entries for each row execute function private.entry_guard();
create function private.entry_history() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.entry_versions(organization_id,patient_id,entry_id,version,snapshot,created_by)
  values(new.organization_id,new.patient_id,new.id,new.version,to_jsonb(new),coalesce(auth.uid(),new.created_by));
  return new;
end $$;
create trigger entries_history after insert or update on public.entries for each row execute function private.entry_history();

create function private.audit_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.audit_events(organization_id,actor_id,action,entity_type,entity_id)
  values(new.organization_id,auth.uid(),lower(TG_OP),TG_TABLE_NAME,new.id);
  return new;
end $$;
do $$ declare t text; begin
  foreach t in array array['patients','entries','admin_notes','appointments','tasks','enquiries','documents','document_links','memberships','communications'] loop
    execute format('create trigger audit_change after insert or update on public.%I for each row execute function private.audit_change()',t);
  end loop;
end $$;

do $$ declare t text; begin
  foreach t in array array['organizations','memberships','patients','entries','entry_versions','admin_notes','appointments','tasks','enquiries','documents','document_links','communications','audit_events'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
  end loop;
end $$;
grant insert,update on public.patients, public.entries, public.appointments, public.tasks to authenticated;
grant insert on public.admin_notes, public.document_links to authenticated;
grant update(status,internal_notes) on public.enquiries to authenticated;

create policy org_read on public.organizations for select to authenticated using(private.has_role(id,array['proprietario','profissional','recepcao','leitura']));
create policy members_read on public.memberships for select to authenticated using(private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura']));
do $$ declare t text; begin
  foreach t in array array['patients','appointments','tasks','admin_notes','enquiries'] loop
    execute format('create policy staff_read on public.%I for select to authenticated using(private.has_role(organization_id,array[''proprietario'',''profissional'',''recepcao'',''leitura'']))',t);
  end loop;
  foreach t in array array['patients','appointments','tasks'] loop
    execute format('create policy staff_insert on public.%I for insert to authenticated with check(private.has_role(organization_id,array[''proprietario'',''profissional'',''recepcao'']) and created_by=auth.uid())',t);
    execute format('create policy staff_update on public.%I for update to authenticated using(private.has_role(organization_id,array[''proprietario'',''profissional'',''recepcao''])) with check(private.has_role(organization_id,array[''proprietario'',''profissional'',''recepcao'']))',t);
  end loop;
  foreach t in array array['entries','entry_versions','documents','document_links','communications'] loop
    execute format('create policy clinical_read on public.%I for select to authenticated using(private.has_role(organization_id,array[''proprietario'',''profissional'']))',t);
  end loop;
end $$;
create policy note_insert on public.admin_notes for insert to authenticated with check(private.has_role(organization_id,array['proprietario','profissional','recepcao']) and created_by=auth.uid());
create policy entries_insert on public.entries for insert to authenticated with check(private.has_role(organization_id,array['proprietario','profissional']) and created_by=auth.uid());
create policy entries_update on public.entries for update to authenticated using(private.has_role(organization_id,array['proprietario','profissional']) and created_by=auth.uid() and status='rascunho') with check(private.has_role(organization_id,array['proprietario','profissional']) and created_by=auth.uid());
create policy links_insert on public.document_links for insert to authenticated with check(private.has_role(organization_id,array['proprietario','profissional']) and created_by=auth.uid());
create policy enquiry_update on public.enquiries for update to authenticated using(private.has_role(organization_id,array['proprietario','profissional','recepcao'])) with check(private.has_role(organization_id,array['proprietario','profissional','recepcao']));
create policy audit_read on public.audit_events for select to authenticated using(private.has_role(organization_id,array['proprietario']));

create function public.convert_enquiry(enquiry uuid, existing_patient uuid default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare e public.enquiries; p uuid;
begin
  select * into e from public.enquiries where id=enquiry for update;
  if not found or not private.has_role(e.organization_id,array['proprietario','profissional','recepcao']) then raise exception 'not_authorized'; end if;
  if e.patient_id is not null then return e.patient_id; end if;
  if existing_patient is not null then
    if not exists(select 1 from public.patients where id=existing_patient and organization_id=e.organization_id) then raise exception 'invalid_patient'; end if;
    p:=existing_patient;
  else
    insert into public.patients(organization_id,full_name,phone,email,created_by)
    values(e.organization_id,e.full_name,e.phone,e.email,auth.uid()) returning id into p;
  end if;
  update public.enquiries set patient_id=p,status='convertido',updated_at=now(),version=version+1 where id=e.id;
  return p;
end $$;

create function public.record_access(org uuid, entity uuid, event text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if event not in ('abertura_prontuario','exportacao_prontuario','download_documento') or not private.has_role(org,array['proprietario','profissional']) then raise exception 'not_authorized'; end if;
  if event='download_documento' then
    if not exists(select 1 from public.documents where id=entity and organization_id=org) then raise exception 'invalid_entity'; end if;
  elsif not exists(select 1 from public.patients where id=entity and organization_id=org) then raise exception 'invalid_entity'; end if;
  insert into public.audit_events(organization_id,actor_id,action,entity_type,entity_id)
  values(org,auth.uid(),event,case when event='download_documento' then 'documents' else 'patients' end,entity);
end $$;

create function public.consume_rate_limit(rate_key text, max_hits integer, seconds integer) returns boolean
language plpgsql security definer set search_path='' as $$
declare n integer;
begin
  delete from private.rate_limits where window_start<now()-interval '2 days';
  insert into private.rate_limits(key,window_start,hits) values(rate_key,now(),1)
  on conflict(key) do update set hits=case when private.rate_limits.window_start<now()-make_interval(secs=>seconds) then 1 else private.rate_limits.hits+1 end,
    window_start=case when private.rate_limits.window_start<now()-make_interval(secs=>seconds) then now() else private.rate_limits.window_start end
  returning hits into n;
  return n<=max_hits;
end $$;

create function public.reserve_document(org uuid, patient uuid, filename text, mime text, bytes bigint, digest text, category_name text, actor uuid)
returns public.documents language plpgsql security definer set search_path='' as $$
declare d public.documents; used bigint;
begin
  perform pg_advisory_xact_lock(hashtext('clinic_storage'));
  select coalesce(sum(size_bytes),0) into used from public.documents where status<>'falha';
  if used+bytes>800000000 then raise exception 'storage_limit'; end if;
  select * into d from public.documents where organization_id=org and patient_id=patient and sha256=digest;
  if found then
    if d.status='pronto' then return d; end if;
    raise exception 'upload_pending_or_failed';
  end if;
  insert into public.documents(organization_id,patient_id,name,path,mime_type,size_bytes,sha256,category,created_by)
  values(org,patient,filename,org::text||'/'||patient::text||'/'||gen_random_uuid()::text,mime,bytes,digest,category_name,actor) returning * into d;
  return d;
end $$;

create function public.storage_usage() returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  if not private.has_role('a783bd4c-f253-4a94-9365-75c6f1000001',array['proprietario']) then raise exception 'not_authorized'; end if;
  select jsonb_build_object('bytes',coalesce(sum(size_bytes),0),'files',count(*),'limit',800000000,
    'database_bytes',pg_database_size(current_database())) into result from public.documents where status<>'falha';
  return result;
end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('patient-files','patient-files',false,8388608,array['application/pdf','image/jpeg','image/png','image/webp']);
create policy private_document_read on storage.objects for select to authenticated using(
  bucket_id='patient-files' and exists(select 1 from public.documents d where d.path=storage.objects.name and d.status='pronto'
    and private.has_role(d.organization_id,array['proprietario','profissional']))
);
-- Uploads are accepted only by the authenticated, byte-validating files function.
-- No browser insert/update/delete policies exist on storage.objects or documents.
revoke all on all functions in schema private from public,anon;
revoke all on function public.consume_rate_limit(text,integer,integer) from public,anon,authenticated;
revoke all on function public.reserve_document(uuid,uuid,text,text,bigint,text,text,uuid) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,integer,integer), public.reserve_document(uuid,uuid,text,text,bigint,text,text,uuid) to service_role;
revoke all on function public.revoke_current_session(),public.convert_enquiry(uuid,uuid),public.record_access(uuid,uuid,text),public.storage_usage() from public,anon;
grant execute on function public.revoke_current_session(),public.convert_enquiry(uuid,uuid),public.record_access(uuid,uuid,text),public.storage_usage() to authenticated;
grant all on all tables in schema public to service_role;
grant usage,select on all sequences in schema public to service_role;
commit;
