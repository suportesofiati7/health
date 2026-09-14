begin;

-- Additive clinical model. Existing entries remain the immutable narrative record.
alter table public.appointments add constraint appointments_organization_id_id_key unique(organization_id,id);
create table public.procedures (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
  name text not null check(length(name) between 2 and 200), category text not null default 'outro', active boolean not null default true,
  default_duration integer not null default 60 check(default_duration between 5 and 720), assessment_required boolean not null default true,
  product_relevant boolean not null default false, lot_required boolean not null default false, device_relevant boolean not null default false,
  photos_expected boolean not null default false, followup_days integer check(followup_days is null or followup_days between 0 and 3650),
  contraindication_prompts jsonb not null default '[]' check(jsonb_typeof(contraindication_prompts) = 'array'),
  post_care text not null default '', consent_template text not null default '', created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id)
);
create index procedures_active on public.procedures(organization_id,active,name);

create table public.products (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
  name text not null check(length(name) between 2 and 200), manufacturer text not null default '', unit text not null default '', active boolean not null default true,
  created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id)
);
create table public.product_lots (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, product_id uuid not null, lot text not null,
  expires_on date, quantity numeric, unit text not null default '', active boolean not null default true,
  created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(organization_id,id), unique(organization_id,product_id,lot),
  foreign key(organization_id,product_id) references public.products(organization_id,id)
);
create index product_lots_expiry on public.product_lots(organization_id,expires_on);

create table public.devices (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), name text not null,
  serial_number text not null default '', active boolean not null default true, notes text not null default '',
  created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id)
);

create table public.treatment_plans (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, patient_id uuid not null, assessment_id uuid,
  title text not null default 'Plano de tratamento', objectives text not null default '', areas text not null default '', professional_notes text not null default '',
  responsible_user uuid references auth.users(id), status text not null default 'planejado' check(status in ('planejado','em_andamento','concluido','suspenso','cancelado')),
  expected_followup date, created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(organization_id,id), foreign key(organization_id,patient_id) references public.patients(organization_id,id),
  foreign key(organization_id,patient_id,assessment_id) references public.entries(organization_id,patient_id,id)
);
create table public.treatment_plan_items (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, plan_id uuid not null, procedure_id uuid not null,
  sequence_no integer not null default 1 check(sequence_no>0), area text not null default '', sessions integer not null default 1 check(sessions between 1 and 100), notes text not null default '',
  created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(), unique(organization_id,id),
  foreign key(organization_id,plan_id) references public.treatment_plans(organization_id,id), foreign key(organization_id,procedure_id) references public.procedures(organization_id,id)
);

create table public.clinical_procedures (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, patient_id uuid not null, procedure_id uuid not null,
  appointment_id uuid, plan_id uuid, professional_id uuid not null, performed_at timestamptz not null default now(), area text not null default '', indication text not null default '',
  observations text not null default '', technique text not null default '', parameters jsonb not null default '{}' check(jsonb_typeof(parameters)='object'), post_care text not null default '',
  consent_status text not null default 'pendente' check(consent_status in ('pendente','aceito','recusado','nao_aplicavel')), status text not null default 'rascunho' check(status in ('rascunho','finalizado')),
  created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(), finalized_at timestamptz,
  unique(organization_id,id), foreign key(organization_id,patient_id) references public.patients(organization_id,id),
  foreign key(organization_id,procedure_id) references public.procedures(organization_id,id), foreign key(organization_id,appointment_id) references public.appointments(organization_id,id),
  foreign key(organization_id,plan_id) references public.treatment_plans(organization_id,id), foreign key(organization_id,professional_id) references public.memberships(organization_id,user_id)
);
create table public.product_usages (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, clinical_procedure_id uuid not null, lot_id uuid not null,
  quantity numeric, unit text not null default '', created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(), unique(organization_id,id),
  foreign key(organization_id,clinical_procedure_id) references public.clinical_procedures(organization_id,id), foreign key(organization_id,lot_id) references public.product_lots(organization_id,id)
);

create table public.clinical_photos (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, patient_id uuid not null, clinical_procedure_id uuid,
  path text not null unique, category text not null check(category in ('antes','durante','depois','evolucao')), area text not null default '', description text not null default '', mime_type text not null,
  size_bytes bigint not null check(size_bytes between 1 and 8388608), created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id), foreign key(organization_id,clinical_procedure_id) references public.clinical_procedures(organization_id,id)
);
create table public.consents (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, patient_id uuid not null, clinical_procedure_id uuid, kind text not null check(kind in ('procedimento','privacidade','fotografia_clinica','publicacao_marketing','comunicacao','reserva')), template_version text not null,
  status text not null check(status in ('aceito','recusado','revogado','pendente')), method text not null default 'presencial', document_id uuid, accepted_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id), foreign key(organization_id,clinical_procedure_id) references public.clinical_procedures(organization_id,id),
  foreign key(organization_id,patient_id,document_id) references public.documents(organization_id,patient_id,id)
);
create table public.follow_ups (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, patient_id uuid not null, clinical_procedure_id uuid,
  expected_on date not null, window_end date, professional_id uuid, appointment_id uuid, notes text not null default '', status text not null default 'aguardando_agendamento' check(status in ('aguardando_agendamento','agendado','vencido','concluido')),
  created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id), foreign key(organization_id,clinical_procedure_id) references public.clinical_procedures(organization_id,id), foreign key(organization_id,professional_id) references public.memberships(organization_id,user_id), foreign key(organization_id,appointment_id) references public.appointments(organization_id,id)
);
create table public.adverse_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, patient_id uuid not null, clinical_procedure_id uuid, event_at timestamptz not null default now(),
  description text not null default '', symptoms text not null default '', assessment text not null default '', actions text not null default '', guidance text not null default '', contact_attempts text not null default '', referral text not null default '', followup_deadline date,
  outcome text not null default '', responsible_user uuid references auth.users(id), status text not null default 'em_acompanhamento' check(status in ('em_acompanhamento','resolvida','encaminhada')),
  created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id), foreign key(organization_id,clinical_procedure_id) references public.clinical_procedures(organization_id,id)
);
create table public.privacy_requests (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, patient_id uuid, request_type text not null check(request_type in ('acesso','correcao','exportacao','restricao','exclusao')),
  received_on date not null default current_date, status text not null default 'recebida' check(status in ('recebida','em_analise','resolvida','retencao_legal')), responsible_user uuid references auth.users(id), resolution text not null default '', notes text not null default '', created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id)
);

do $$ declare t text; begin
  foreach t in array array['procedures','products','product_lots','devices','treatment_plans','treatment_plan_items','clinical_procedures','product_usages','clinical_photos','consents','follow_ups','adverse_events','privacy_requests'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon,authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
    if t in ('procedures','products','product_lots','devices','follow_ups','privacy_requests') then
      execute format('create policy clinic_read on public.%I for select to authenticated using(private.has_role(organization_id,array[''proprietario'',''profissional'',''recepcao'',''leitura'']))',t);
    else
      execute format('create policy clinic_read on public.%I for select to authenticated using(private.has_role(organization_id,array[''proprietario'',''profissional'']))',t);
    end if;
  end loop;
end $$;
grant insert on public.procedures,public.products,public.product_lots,public.devices,public.treatment_plans,public.treatment_plan_items,public.clinical_procedures,public.product_usages,public.clinical_photos,public.consents,public.follow_ups,public.adverse_events,public.privacy_requests to authenticated;
grant update on public.procedures,public.products,public.product_lots,public.devices,public.treatment_plans,public.clinical_procedures,public.follow_ups,public.adverse_events,public.privacy_requests to authenticated;
do $$ declare t text; begin
  foreach t in array array['treatment_plans','treatment_plan_items','clinical_procedures','product_usages','clinical_photos','consents','adverse_events'] loop
    execute format('create policy clinical_write on public.%I for insert to authenticated with check(private.has_role(organization_id,array[''proprietario'',''profissional'']) and created_by=auth.uid())',t);
  end loop;
  foreach t in array array['follow_ups','privacy_requests'] loop
    execute format('create policy operational_write on public.%I for insert to authenticated with check(private.has_role(organization_id,array[''proprietario'',''profissional'',''recepcao'']) and created_by=auth.uid())',t);
  end loop;
end $$;
create policy operational_write on public.procedures for insert to authenticated with check(private.has_role(organization_id,array['proprietario']));
create policy operational_update on public.procedures for update to authenticated using(private.has_role(organization_id,array['proprietario'])) with check(private.has_role(organization_id,array['proprietario']));
create policy operational_product_write on public.products for insert to authenticated with check(private.has_role(organization_id,array['proprietario']));
create policy operational_lot_write on public.product_lots for insert to authenticated with check(private.has_role(organization_id,array['proprietario']));
create policy operational_device_write on public.devices for insert to authenticated with check(private.has_role(organization_id,array['proprietario']));

-- Private bucket for photos; object paths are UUID-based and still require policy authorization.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('clinical-photos','clinical-photos',false,8388608,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy clinical_photo_read on storage.objects for select to authenticated using(bucket_id='clinical-photos' and exists(select 1 from public.clinical_photos p where p.path=storage.objects.name and private.has_role(p.organization_id,array['proprietario','profissional'])));

-- Verified against the existing public site/form; owner can inactivate or extend this list.
insert into public.procedures(organization_id,name,category,default_duration,product_relevant,lot_required,device_relevant,photos_expected,followup_days)
select 'a783bd4c-f253-4a94-9365-75c6f1000001',v.name,v.category,v.duration,v.product_relevant,v.lot_required,v.device_relevant,v.photos_expected,v.followup_days
from (values
 ('Laser Harmony — rejuvenescimento leve/moderado','laser',60,false,false,true,true,30),
 ('Laser Harmony — clareamento de manchas','laser',60,false,false,true,true,45),
 ('Laser Harmony — remoção de tatuagem/micropigmentação','laser',60,false,false,true,true,45),
 ('Laser Harmony — melasma','laser',60,false,false,true,true,45),
 ('Laser LightSheer Duet — remoção de pelos / foliculite','laser',45,false,false,true,true,45),
 ('Toxina Botulínica — facial','injetável',60,true,true,false,true,14),
 ('Toxina Botulínica — pescoço/mandíbula / técnica Nefertiti','injetável',60,true,true,false,true,14),
 ('Laser CO₂ AcuPulse — rejuvenescimento profundo','laser',120,false,false,true,true,30),
 ('Ultraformer MPT','ultrassom',60,false,false,true,true,30),
 ('Radiofrequência','energia',45,false,false,true,true,30),
 ('Jato de Plasma','energia',60,false,false,true,true,30),
 ('Mesoterapia Capilar / MMP Capilar','capilar',60,true,true,false,true,30),
 ('MMP — rejuvenescimento / cicatriz de acne / estrias','microinfusão',60,true,true,false,true,30),
 ('PEIM','vascular',60,true,true,false,true,30),
 ('Peeling Ultrassônico','peeling',45,false,false,true,true,14),
 ('Peeling de Cristal','peeling',45,false,false,true,true,14),
 ('Peeling de Diamante','peeling',45,false,false,true,true,14),
 ('Peeling Químico','peeling',60,true,true,false,true,21),
 ('Enzimas','injetável',60,true,true,false,true,30),
 ('Limpeza de Pele','higiene',90,false,false,false,true,14)
) as v(name,category,duration,product_relevant,lot_required,device_relevant,photos_expected,followup_days)
where not exists(select 1 from public.procedures p where p.organization_id='a783bd4c-f253-4a94-9365-75c6f1000001' and p.name=v.name);

commit;
