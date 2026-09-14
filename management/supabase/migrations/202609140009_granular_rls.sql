begin;

-- ============================================================
-- GRANULAR PERMISSION BACKEND ENFORCEMENT
-- ============================================================

create or replace function private.has_permission(
  org uuid,
  permission_area text,
  permission_action text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    -- Owner always retains full access.
    private.has_role(org, array['proprietario'])

    or

    exists (
      select 1
      from public.memberships m
      join public.staff_permissions p
        on p.organization_id = m.organization_id
       and p.user_id = m.user_id
      where m.organization_id = org
        and m.user_id = auth.uid()
        and m.status = 'ativo'
        and p.area = permission_area
        and case permission_action
          when 'view' then p.can_view
          when 'create' then p.can_create
          when 'edit' then p.can_edit
          when 'finalize' then p.can_finalize
          when 'export' then p.can_export
          when 'share' then p.can_share
          else false
        end
    );
$$;

revoke all on function private.has_permission(uuid,text,text)
from public, anon;

grant execute on function private.has_permission(uuid,text,text)
to authenticated, service_role;


create or replace function private.has_any_clinical_permission(
  org uuid,
  permission_action text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.has_permission(org,'assessments',permission_action)
    or private.has_permission(org,'anamnesis',permission_action)
    or private.has_permission(org,'treatment_plans',permission_action)
    or private.has_permission(org,'procedures',permission_action)
    or private.has_permission(org,'evolutions',permission_action)
    or private.has_permission(org,'adverse_events',permission_action)
    or private.has_permission(org,'consents',permission_action);
$$;

revoke all on function private.has_any_clinical_permission(uuid,text)
from public, anon;

grant execute on function private.has_any_clinical_permission(uuid,text)
to authenticated, service_role;


-- ============================================================
-- DEFAULT PERMISSIONS FOR EXISTING STAFF
--
-- This preserves sensible current access while allowing Owner
-- to remove individual permissions afterward.
-- ============================================================

-- PROFESSIONAL
insert into public.staff_permissions
(
  organization_id,
  user_id,
  area,
  can_view,
  can_create,
  can_edit,
  can_finalize,
  can_export,
  can_share,
  updated_by
)
select
  m.organization_id,
  m.user_id,
  a.area,
  a.v,
  a.c,
  a.e,
  a.f,
  a.x,
  a.s,
  m.user_id
from public.memberships m
cross join (
  values
    ('patient_identity', true,true,true,false,false,false),
    ('appointments',true,true,true,false,false,false),
    ('intake_forms',true,true,true,false,false,false),
    ('assessments',true,true,true,true,false,false),
    ('anamnesis',true,true,true,true,false,false),
    ('treatment_plans',true,true,true,true,false,false),
    ('procedures',true,true,true,true,false,false),
    ('evolutions',true,true,true,true,false,false),
    ('adverse_events',true,true,true,true,false,false),
    ('photos',true,true,true,false,false,true),
    ('documents',true,true,true,false,true,true),
    ('consents',true,true,true,true,false,true),
    ('reports',true,false,false,false,false,false),
    ('exports',false,false,false,false,true,false),
    ('patient_portal',true,false,false,false,false,true),
    ('settings',false,false,false,false,false,false),
    ('users',false,false,false,false,false,false),
    ('audit',false,false,false,false,false,false)
) as a(area,v,c,e,f,x,s)
where m.role = 'profissional'
  and m.status = 'ativo'
on conflict (organization_id,user_id,area)
do nothing;


-- RECEPTION
insert into public.staff_permissions
(
  organization_id,
  user_id,
  area,
  can_view,
  can_create,
  can_edit,
  can_finalize,
  can_export,
  can_share,
  updated_by
)
select
  m.organization_id,
  m.user_id,
  a.area,
  a.v,
  a.c,
  a.e,
  false,
  false,
  a.s,
  m.user_id
from public.memberships m
cross join (
  values
    ('patient_identity',true,true,true,false),
    ('appointments',true,true,true,false),
    ('intake_forms',true,true,true,false),
    ('assessments',false,false,false,false),
    ('anamnesis',false,false,false,false),
    ('treatment_plans',false,false,false,false),
    ('procedures',false,false,false,false),
    ('evolutions',false,false,false,false),
    ('adverse_events',false,false,false,false),
    ('photos',false,false,false,false),
    ('documents',false,false,false,false),
    ('consents',false,false,false,false),
    ('reports',false,false,false,false),
    ('exports',false,false,false,false),
    ('patient_portal',true,false,false,true),
    ('settings',false,false,false,false),
    ('users',false,false,false,false),
    ('audit',false,false,false,false)
) as a(area,v,c,e,s)
where m.role = 'recepcao'
  and m.status = 'ativo'
on conflict (organization_id,user_id,area)
do nothing;


-- READ-ONLY ADMINISTRATIVE ROLE
insert into public.staff_permissions
(
  organization_id,
  user_id,
  area,
  can_view,
  can_create,
  can_edit,
  can_finalize,
  can_export,
  can_share,
  updated_by
)
select
  m.organization_id,
  m.user_id,
  a.area,
  a.v,
  false,
  false,
  false,
  false,
  false,
  m.user_id
from public.memberships m
cross join (
  values
    ('patient_identity',true),
    ('appointments',true),
    ('intake_forms',true),
    ('assessments',false),
    ('anamnesis',false),
    ('treatment_plans',false),
    ('procedures',false),
    ('evolutions',false),
    ('adverse_events',false),
    ('photos',false),
    ('documents',false),
    ('consents',false),
    ('reports',true),
    ('exports',false),
    ('patient_portal',false),
    ('settings',false),
    ('users',false),
    ('audit',false)
) as a(area,v)
where m.role = 'leitura'
  and m.status = 'ativo'
on conflict (organization_id,user_id,area)
do nothing;


-- ============================================================
-- PATIENT IDENTITY
-- ============================================================

drop policy if exists staff_read on public.patients;
create policy staff_read
on public.patients
for select
to authenticated
using (
  private.has_permission(organization_id,'patient_identity','view')
);

drop policy if exists staff_insert on public.patients;
create policy staff_insert
on public.patients
for insert
to authenticated
with check (
  private.has_permission(organization_id,'patient_identity','create')
  and created_by = auth.uid()
);

drop policy if exists staff_update on public.patients;
create policy staff_update
on public.patients
for update
to authenticated
using (
  private.has_permission(organization_id,'patient_identity','edit')
)
with check (
  private.has_permission(organization_id,'patient_identity','edit')
);


-- ============================================================
-- APPOINTMENTS
-- ============================================================

drop policy if exists staff_read on public.appointments;
create policy staff_read
on public.appointments
for select
to authenticated
using (
  private.has_permission(organization_id,'appointments','view')
);

drop policy if exists staff_insert on public.appointments;
create policy staff_insert
on public.appointments
for insert
to authenticated
with check (
  private.has_permission(organization_id,'appointments','create')
  and created_by = auth.uid()
);

drop policy if exists staff_update on public.appointments;
create policy staff_update
on public.appointments
for update
to authenticated
using (
  private.has_permission(organization_id,'appointments','edit')
)
with check (
  private.has_permission(organization_id,'appointments','edit')
);


-- ============================================================
-- PUBLIC INTAKES / FORMULÁRIOS
-- ============================================================

drop policy if exists intake_read on public.public_intakes;
create policy intake_read
on public.public_intakes
for select
to authenticated
using (
  private.has_permission(organization_id,'intake_forms','view')
);

drop policy if exists intake_update on public.public_intakes;
create policy intake_update
on public.public_intakes
for update
to authenticated
using (
  private.has_permission(organization_id,'intake_forms','edit')
)
with check (
  private.has_permission(organization_id,'intake_forms','edit')
);

drop policy if exists intake_files_read on public.public_intake_files;
create policy intake_files_read
on public.public_intake_files
for select
to authenticated
using (
  private.has_permission(organization_id,'intake_forms','view')
);


-- Legacy enquiries
drop policy if exists staff_read on public.enquiries;
create policy staff_read
on public.enquiries
for select
to authenticated
using (
  private.has_permission(organization_id,'intake_forms','view')
);

drop policy if exists enquiry_update on public.enquiries;
create policy enquiry_update
on public.enquiries
for update
to authenticated
using (
  private.has_permission(organization_id,'intake_forms','edit')
)
with check (
  private.has_permission(organization_id,'intake_forms','edit')
);


-- ============================================================
-- HEALTH HISTORY / ANAMNESIS
-- ============================================================

drop policy if exists health_read on public.patient_health_history;
create policy health_read
on public.patient_health_history
for select
to authenticated
using (
  private.has_permission(organization_id,'anamnesis','view')
);

drop policy if exists health_write on public.patient_health_history;
create policy health_write
on public.patient_health_history
for insert
to authenticated
with check (
  private.has_permission(organization_id,'anamnesis','create')
  and created_by = auth.uid()
);


-- ============================================================
-- TREATMENT PLANS
-- ============================================================

drop policy if exists clinic_read on public.treatment_plans;
create policy clinic_read
on public.treatment_plans
for select
to authenticated
using (
  private.has_permission(organization_id,'treatment_plans','view')
);

drop policy if exists clinical_write on public.treatment_plans;
create policy clinical_write
on public.treatment_plans
for insert
to authenticated
with check (
  private.has_permission(organization_id,'treatment_plans','create')
  and created_by = auth.uid()
);

drop policy if exists treatment_plan_update on public.treatment_plans;
create policy treatment_plan_update
on public.treatment_plans
for update
to authenticated
using (
  private.has_permission(organization_id,'treatment_plans','edit')
)
with check (
  private.has_permission(organization_id,'treatment_plans','edit')
);


drop policy if exists clinic_read on public.treatment_plan_items;
create policy clinic_read
on public.treatment_plan_items
for select
to authenticated
using (
  private.has_permission(organization_id,'treatment_plans','view')
);

drop policy if exists clinical_write on public.treatment_plan_items;
create policy clinical_write
on public.treatment_plan_items
for insert
to authenticated
with check (
  private.has_permission(organization_id,'treatment_plans','create')
  and created_by = auth.uid()
);

drop policy if exists treatment_plan_item_update
on public.treatment_plan_items;

create policy treatment_plan_item_update
on public.treatment_plan_items
for update
to authenticated
using (
  private.has_permission(organization_id,'treatment_plans','edit')
)
with check (
  private.has_permission(organization_id,'treatment_plans','edit')
);


-- ============================================================
-- PROCEDURES
-- ============================================================

drop policy if exists clinic_read on public.clinical_procedures;
create policy clinic_read
on public.clinical_procedures
for select
to authenticated
using (
  private.has_permission(organization_id,'procedures','view')
);

drop policy if exists clinical_write on public.clinical_procedures;
create policy clinical_write
on public.clinical_procedures
for insert
to authenticated
with check (
  private.has_permission(organization_id,'procedures','create')
  and created_by = auth.uid()
);

drop policy if exists clinical_procedure_draft_update
on public.clinical_procedures;

create policy clinical_procedure_draft_update
on public.clinical_procedures
for update
to authenticated
using (
  private.has_permission(organization_id,'procedures','edit')
  and status = 'rascunho'
)
with check (
  private.has_permission(organization_id,'procedures','edit')
);


drop policy if exists clinic_read on public.product_usages;
create policy clinic_read
on public.product_usages
for select
to authenticated
using (
  private.has_permission(organization_id,'procedures','view')
);

drop policy if exists clinical_write on public.product_usages;
create policy clinical_write
on public.product_usages
for insert
to authenticated
with check (
  private.has_permission(organization_id,'procedures','create')
  and created_by = auth.uid()
);


drop policy if exists procedure_devices_read
on public.procedure_devices;

create policy procedure_devices_read
on public.procedure_devices
for select
to authenticated
using (
  private.has_permission(organization_id,'procedures','view')
);

drop policy if exists procedure_devices_write
on public.procedure_devices;

create policy procedure_devices_write
on public.procedure_devices
for all
to authenticated
using (
  private.has_permission(organization_id,'procedures','edit')
)
with check (
  private.has_permission(organization_id,'procedures','edit')
);


-- ============================================================
-- ADVERSE EVENTS / INTERCORRÊNCIAS
-- ============================================================

drop policy if exists clinic_read on public.adverse_events;
create policy clinic_read
on public.adverse_events
for select
to authenticated
using (
  private.has_permission(organization_id,'adverse_events','view')
);

drop policy if exists clinical_write on public.adverse_events;
create policy clinical_write
on public.adverse_events
for insert
to authenticated
with check (
  private.has_permission(organization_id,'adverse_events','create')
  and created_by = auth.uid()
);


-- ============================================================
-- CLINICAL PHOTOS
-- ============================================================

drop policy if exists clinic_read on public.clinical_photos;
create policy clinic_read
on public.clinical_photos
for select
to authenticated
using (
  private.has_permission(organization_id,'photos','view')
);

drop policy if exists clinical_write on public.clinical_photos;
create policy clinical_write
on public.clinical_photos
for insert
to authenticated
with check (
  private.has_permission(organization_id,'photos','create')
  and created_by = auth.uid()
);

drop policy if exists clinical_photo_metadata_update
on public.clinical_photos;

create policy clinical_photo_metadata_update
on public.clinical_photos
for update
to authenticated
using (
  private.has_permission(organization_id,'photos','edit')
)
with check (
  private.has_permission(organization_id,'photos','edit')
);


drop policy if exists clinical_photo_read on storage.objects;

create policy clinical_photo_read
on storage.objects
for select
to authenticated
using (
  bucket_id = 'clinical-photos'
  and exists (
    select 1
    from public.clinical_photos p
    where p.path = storage.objects.name
      and private.has_permission(
        p.organization_id,
        'photos',
        'view'
      )
  )
);


-- ============================================================
-- DOCUMENTS
-- ============================================================

drop policy if exists clinical_read on public.documents;
create policy clinical_read
on public.documents
for select
to authenticated
using (
  private.has_permission(organization_id,'documents','view')
);

drop policy if exists clinical_read on public.document_links;
create policy clinical_read
on public.document_links
for select
to authenticated
using (
  private.has_permission(organization_id,'documents','view')
);

drop policy if exists links_insert on public.document_links;
create policy links_insert
on public.document_links
for insert
to authenticated
with check (
  private.has_permission(organization_id,'documents','create')
  and created_by = auth.uid()
);


drop policy if exists private_document_read on storage.objects;

create policy private_document_read
on storage.objects
for select
to authenticated
using (
  bucket_id = 'patient-files'
  and exists (
    select 1
    from public.documents d
    where d.path = storage.objects.name
      and d.status = 'pronto'
      and private.has_permission(
        d.organization_id,
        'documents',
        'view'
      )
  )
);


-- ============================================================
-- CONSENTS
-- ============================================================

drop policy if exists clinic_read on public.consents;
create policy clinic_read
on public.consents
for select
to authenticated
using (
  private.has_permission(organization_id,'consents','view')
);

drop policy if exists clinical_write on public.consents;
create policy clinical_write
on public.consents
for insert
to authenticated
with check (
  private.has_permission(organization_id,'consents','create')
  and created_by = auth.uid()
);

drop policy if exists consent_update on public.consents;
create policy consent_update
on public.consents
for update
to authenticated
using (
  private.has_permission(organization_id,'consents','edit')
)
with check (
  private.has_permission(organization_id,'consents','edit')
);


-- ============================================================
-- PATIENT PORTAL SHARING
-- ============================================================

drop policy if exists portal_shares_read
on public.patient_portal_shares;

create policy portal_shares_read
on public.patient_portal_shares
for select
to authenticated
using (
  private.has_permission(
    organization_id,
    'patient_portal',
    'view'
  )
);

drop policy if exists portal_shares_write
on public.patient_portal_shares;

create policy portal_shares_write
on public.patient_portal_shares
for all
to authenticated
using (
  private.has_permission(
    organization_id,
    'patient_portal',
    'share'
  )
)
with check (
  private.has_permission(
    organization_id,
    'patient_portal',
    'share'
  )
  and shared_by = auth.uid()
);


-- ============================================================
-- AUDIT
-- ============================================================

drop policy if exists audit_read on public.audit_events;

create policy audit_read
on public.audit_events
for select
to authenticated
using (
  private.has_permission(
    organization_id,
    'audit',
    'view'
  )
);


-- ============================================================
-- LEGACY GENERIC CLINICAL RECORDS
--
-- entries contains several clinical record types, so require
-- at least one clinical permission rather than broad role alone.
-- ============================================================

drop policy if exists clinical_read on public.entries;

create policy clinical_read
on public.entries
for select
to authenticated
using (
  private.has_any_clinical_permission(
    organization_id,
    'view'
  )
);

drop policy if exists entries_insert on public.entries;

create policy entries_insert
on public.entries
for insert
to authenticated
with check (
  private.has_any_clinical_permission(
    organization_id,
    'create'
  )
  and created_by = auth.uid()
);

drop policy if exists entries_update on public.entries;

create policy entries_update
on public.entries
for update
to authenticated
using (
  private.has_any_clinical_permission(
    organization_id,
    'edit'
  )
  and created_by = auth.uid()
  and status = 'rascunho'
)
with check (
  private.has_any_clinical_permission(
    organization_id,
    'edit'
  )
  and created_by = auth.uid()
);


-- Entry versions follow generic clinical access.
drop policy if exists clinical_read on public.entry_versions;

create policy clinical_read
on public.entry_versions
for select
to authenticated
using (
  private.has_any_clinical_permission(
    organization_id,
    'view'
  )
);


commit;
