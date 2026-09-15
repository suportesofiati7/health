begin;

-- One internal intake per patient. The public submission remains immutable in
-- public_intakes; this table is the editable working copy with provenance.
create table if not exists public.master_intakes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  patient_id uuid not null,
  source_intake_id uuid references public.public_intakes(id),
  status text not null default 'rascunho' check (status in ('rascunho','em_revisao','finalizado')),
  data jsonb not null default '{}' check (jsonb_typeof(data) = 'object'),
  provenance jsonb not null default '{}' check (jsonb_typeof(provenance) = 'object'),
  missing_fields text[] not null default '{}',
  created_by uuid not null default auth.uid() references auth.users(id),
  updated_by uuid not null default auth.uid() references auth.users(id),
  reviewed_by uuid references auth.users(id),
  finalized_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, patient_id),
  foreign key (organization_id, patient_id) references public.patients(organization_id, id)
);
create table if not exists public.master_intake_versions (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id),
  master_intake_id uuid not null references public.master_intakes(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(master_intake_id, version)
);
create index if not exists master_intakes_source on public.master_intakes(organization_id, source_intake_id);
create index if not exists master_intake_versions_time on public.master_intake_versions(master_intake_id, created_at desc);

alter table public.master_intakes enable row level security;
alter table public.master_intake_versions enable row level security;
revoke all on public.master_intakes, public.master_intake_versions from anon, authenticated;
grant select on public.master_intakes, public.master_intake_versions to authenticated;
grant execute on function private.has_role(uuid,text[]) to authenticated;

create policy master_intake_read on public.master_intakes for select to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura']));
create policy master_intake_versions_read on public.master_intake_versions for select to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura']));

create or replace function public.save_master_intake(
  p_patient_id uuid,
  p_source_intake_id uuid,
  p_status text,
  p_data jsonb,
  p_provenance jsonb,
  p_missing_fields text[] default '{}'
) returns uuid language plpgsql security definer set search_path='' as $fn$
declare
  p public.patients%rowtype;
  m public.master_intakes%rowtype;
  result uuid;
  next_version integer;
  is_clinical boolean;
begin
  select * into p from public.patients where id=p_patient_id for update;
  if p.id is null or not private.has_role(p.organization_id,array['proprietario','profissional','recepcao']) then raise exception 'not_authorized'; end if;
  if p_status not in ('rascunho','em_revisao','finalizado') then raise exception 'invalid_status'; end if;
  select * into m from public.master_intakes where organization_id=p.organization_id and patient_id=p.id for update;
  is_clinical := p_data ? 'clinical' or p_data ? 'health' or p_data ? 'consents' or p_data ? 'plans' or p_data ? 'procedures' or p_data ? 'photos';
  if is_clinical and not private.has_role(p.organization_id,array['proprietario','profissional']) then raise exception 'clinical_permission_required'; end if;
  -- Reception may save operational changes without being able to replace or
  -- inspect the clinical half of the record.
  if not private.has_role(p.organization_id,array['proprietario','profissional']) then
    p_data := coalesce(m.data,'{}'::jsonb) || p_data;
  end if;
  if m.id is null then
    insert into public.master_intakes(organization_id,patient_id,source_intake_id,status,data,provenance,missing_fields,created_by,updated_by,reviewed_by,finalized_by)
      values(p.organization_id,p.id,p_source_intake_id,p_status,p_data,p_provenance,p_missing_fields,auth.uid(),auth.uid(),case when p_status='em_revisao' then auth.uid() end,case when p_status='finalizado' then auth.uid() end)
      returning id into result;
    next_version := 1;
  else
    if m.status='finalizado' and p_status='finalizado' then raise exception 'final_intake_requires_new_review'; end if;
    update public.master_intakes set source_intake_id=coalesce(p_source_intake_id,source_intake_id),status=p_status,data=p_data,provenance=p_provenance,missing_fields=p_missing_fields,updated_by=auth.uid(),updated_at=now(),reviewed_by=case when p_status='em_revisao' then auth.uid() else reviewed_by end,finalized_by=case when p_status='finalizado' then auth.uid() else finalized_by end where id=m.id returning id into result;
    select coalesce(max(version),0)+1 into next_version from public.master_intake_versions where master_intake_id=result;
  end if;
  insert into public.master_intake_versions(organization_id,master_intake_id,version,snapshot,created_by)
    values(p.organization_id,result,next_version,jsonb_build_object('status',p_status,'data',p_data,'provenance',p_provenance,'missing_fields',p_missing_fields),auth.uid());
  -- Keep the canonical patient identity/contact fields in sync with the
  -- working copy. Clinical sections intentionally stay in the clinical
  -- record and are never writable by reception.
  update public.patients set
    full_name=coalesce(nullif(p_data->'identity'->>'full_name',''),full_name),
    preferred_name=coalesce(nullif(p_data->'identity'->>'preferred_name',''),preferred_name),
    birth_date=case when coalesce(p_data->'identity'->>'birth_date','')='' then birth_date else (p_data->'identity'->>'birth_date')::date end,
    cpf=case when coalesce(p_data->'identity'->>'cpf','')='' then cpf else regexp_replace(p_data->'identity'->>'cpf','[^0-9]','','g') end,
    rg=coalesce(nullif(p_data->'identity'->>'rg',''),rg),
    phone=case when coalesce(p_data->'contact'->>'phone','')='' then phone else regexp_replace(p_data->'contact'->>'phone','[^0-9]','','g') end,
    email=coalesce(nullif(p_data->'contact'->>'email',''),email),
    address=case when coalesce(p_data->'contact'->>'address','')='' then address else jsonb_build_object('raw',p_data->'contact'->>'address') end
    where id=p.id;
  if p_status='finalizado' then
    insert into public.entries(organization_id,patient_id,kind,title,content,data,status,created_by)
      values(p.organization_id,p.id,'anamnese','Consulta inicial completa','Intake interno finalizado e sincronizado com o registro único do paciente.',p_data,'finalizado',auth.uid());
  end if;
  insert into public.audit_events(organization_id,actor_id,action,entity_type,entity_id) values(p.organization_id,auth.uid(),'master_intake_saved','master_intake',result);
  return result;
end $fn$;
revoke all on function public.save_master_intake(uuid,uuid,text,jsonb,jsonb,text[]) from public,anon;
grant execute on function public.save_master_intake(uuid,uuid,text,jsonb,jsonb,text[]) to authenticated;

commit;
