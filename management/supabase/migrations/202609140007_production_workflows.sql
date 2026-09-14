begin;

-- Additive production workflow fields. Existing narrative records and files remain valid.
alter table public.procedures add column if not exists treatment_areas text not null default '';
alter table public.procedures add column if not exists relevant_fields jsonb not null default '{}' check (jsonb_typeof(relevant_fields) = 'object');
alter table public.procedures add column if not exists device_parameters jsonb not null default '[]' check (jsonb_typeof(device_parameters) = 'array');
alter table public.procedures add column if not exists consent_template_version text not null default '';
alter table public.products add column if not exists category text not null default '';
alter table public.devices add column if not exists equipment_model text not null default '';
alter table public.clinical_procedures add column if not exists device_id uuid;
alter table public.clinical_procedures add column if not exists treatment_area text not null default '';
alter table public.clinical_procedures add column if not exists followup_due date;
alter table public.clinical_procedures add column if not exists adverse_event_id uuid;
alter table public.clinical_photos add column if not exists note text not null default '';
alter table public.documents add column if not exists description text not null default '';
alter table public.documents add column if not exists document_date date;
alter table public.documents add column if not exists clinical_procedure_id uuid;
alter table public.documents add column if not exists patient_shared boolean not null default false;
alter table public.consents add column if not exists language text not null default 'pt-BR';
alter table public.consents add column if not exists revoked_at timestamptz;
alter table public.consents add column if not exists source text not null default 'management';
do $$ begin
  alter table public.clinical_procedures add constraint clinical_procedures_device_fk
    foreign key (organization_id, device_id) references public.devices(organization_id, id);
exception when duplicate_object then null; end $$;

create table if not exists public.patient_health_history (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
  patient_id uuid not null, allergies text not null default '', medications text not null default '', conditions text not null default '',
  surgeries text not null default '', aesthetic_history text not null default '', dermatological_history text not null default '',
  healing_history text not null default '', active_infection text not null default '', pregnancy_breastfeeding text not null default '',
  habits text not null default '', other_notes text not null default '', created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  unique(organization_id,id), foreign key(organization_id,patient_id) references public.patients(organization_id,id)
);

create table if not exists public.procedure_devices (
  organization_id uuid not null references public.organizations(id), procedure_id uuid not null, device_id uuid not null,
  created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(),
  primary key(organization_id,procedure_id,device_id),
  foreign key(organization_id,procedure_id) references public.procedures(organization_id,id),
  foreign key(organization_id,device_id) references public.devices(organization_id,id)
);

create table if not exists public.patient_portal_shares (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), patient_id uuid not null,
  resource_type text not null check(resource_type in ('document','report','photo','consent','post_care','appointment')),
  resource_id uuid, status text not null default 'shared' check(status in ('shared','revoked')),
  shared_by uuid not null default auth.uid() references auth.users(id), shared_at timestamptz not null default now(), revoked_at timestamptz,
  unique(organization_id,id), foreign key(organization_id,patient_id) references public.patients(organization_id,id)
);

create table if not exists public.staff_permissions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), user_id uuid not null references auth.users(id),
  area text not null, can_view boolean not null default false, can_create boolean not null default false, can_edit boolean not null default false,
  can_finalize boolean not null default false, can_export boolean not null default false, can_share boolean not null default false,
  updated_by uuid not null default auth.uid() references auth.users(id), updated_at timestamptz not null default now(),
  unique(organization_id,user_id,area)
);

create index if not exists patient_health_history_patient on public.patient_health_history(organization_id,patient_id,created_at desc);
create index if not exists portal_shares_patient on public.patient_portal_shares(organization_id,patient_id,status);
create index if not exists staff_permissions_user on public.staff_permissions(organization_id,user_id,area);

do $$ declare t text; begin
  foreach t in array array['patient_health_history','procedure_devices','patient_portal_shares','staff_permissions'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon,authenticated',t);
    execute format('grant select,insert,update on public.%I to authenticated',t);
  end loop;
end $$;

create policy health_read on public.patient_health_history for select to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional']));
create policy health_write on public.patient_health_history for insert to authenticated
  with check(private.has_role(organization_id,array['proprietario','profissional']) and created_by=auth.uid());

create policy procedure_devices_read on public.procedure_devices for select to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional']));
create policy procedure_devices_write on public.procedure_devices for all to authenticated
  using(private.has_role(organization_id,array['proprietario']))
  with check(private.has_role(organization_id,array['proprietario']));

create policy portal_shares_read on public.patient_portal_shares for select to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura']));
create policy portal_shares_write on public.patient_portal_shares for all to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional']))
  with check(private.has_role(organization_id,array['proprietario','profissional']) and shared_by=auth.uid());

create policy staff_permissions_read on public.staff_permissions for select to authenticated
  using(private.has_role(organization_id,array['proprietario']));
create policy staff_permissions_write on public.staff_permissions for all to authenticated
  using(private.has_role(organization_id,array['proprietario']))
  with check(private.has_role(organization_id,array['proprietario']));

create policy treatment_plan_update on public.treatment_plans for update to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional']))
  with check(private.has_role(organization_id,array['proprietario','profissional']));
create policy treatment_plan_item_update on public.treatment_plan_items for update to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional']))
  with check(private.has_role(organization_id,array['proprietario','profissional']));
create policy clinical_procedure_draft_update on public.clinical_procedures for update to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional']) and status='rascunho')
  with check(private.has_role(organization_id,array['proprietario','profissional']));
create policy product_update on public.products for update to authenticated
  using(private.has_role(organization_id,array['proprietario']))
  with check(private.has_role(organization_id,array['proprietario']));
create policy lot_update on public.product_lots for update to authenticated
  using(private.has_role(organization_id,array['proprietario']))
  with check(private.has_role(organization_id,array['proprietario']));
create policy device_update on public.devices for update to authenticated
  using(private.has_role(organization_id,array['proprietario']))
  with check(private.has_role(organization_id,array['proprietario']));
create policy consent_update on public.consents for update to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional']))
  with check(private.has_role(organization_id,array['proprietario','profissional']));

-- Keep the existing private bucket model. These policies only authorize metadata
-- access; object retrieval remains through authenticated storage policies/functions.
create policy clinical_photo_metadata_update on public.clinical_photos for update to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional']))
  with check(private.has_role(organization_id,array['proprietario','profissional']));

commit;
