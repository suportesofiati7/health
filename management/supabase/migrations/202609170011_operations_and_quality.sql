begin;

alter table public.appointments
  add column if not exists recurrence_group_id uuid,
  add column if not exists recurrence_index integer,
  add column if not exists waitlist_entry_id uuid;

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), patient_id uuid not null,
  procedure_id uuid, preferred_professional_id uuid, preferred_from timestamptz, preferred_to timestamptz,
  priority text not null default 'normal' check(priority in ('normal','alta','urgente')), status text not null default 'aguardando' check(status in ('aguardando','ofertado','agendado','cancelado')),
  notes text not null default '', created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id), foreign key(organization_id,procedure_id) references public.procedures(organization_id,id), foreign key(organization_id,preferred_professional_id) references public.memberships(organization_id,user_id)
);
alter table public.waitlist_entries enable row level security;
revoke all on public.waitlist_entries from anon, authenticated;
grant select, insert, update on public.waitlist_entries to authenticated;
create policy waitlist_read on public.waitlist_entries for select to authenticated using(private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura']));
create policy waitlist_write on public.waitlist_entries for insert to authenticated with check(private.has_role(organization_id,array['proprietario','profissional','recepcao']) and created_by=auth.uid());
create policy waitlist_update on public.waitlist_entries for update to authenticated using(private.has_role(organization_id,array['proprietario','profissional','recepcao'])) with check(private.has_role(organization_id,array['proprietario','profissional','recepcao']));

alter table public.consents add column if not exists generated_content jsonb not null default '{}' check(jsonb_typeof(generated_content)='object');

-- A compact quality view gives the UI one consistent source for missing catalogue data.
create or replace view public.procedure_catalog_quality as
select p.organization_id, p.id, p.name, p.active, p.review_status, p.next_review_on,
  array_remove(array[
    case when nullif(trim(p.description),'') is null then 'description' end,
    case when nullif(trim(p.indications),'') is null then 'indications' end,
    case when nullif(trim(p.benefits),'') is null then 'benefits' end,
    case when p.price_cents is null then 'price' end,
    case when jsonb_array_length(coalesce(p.source_references,'[]'::jsonb))=0 then 'official_sources' end,
    case when jsonb_array_length(coalesce(p.required_consents,'[]'::jsonb))=0 then 'consent' end
  ], null) as missing_fields
from public.procedures p;
grant select on public.procedure_catalog_quality to authenticated;

create index if not exists waitlist_priority_idx on public.waitlist_entries(organization_id,status,priority,created_at);
create index if not exists appointments_recurrence_idx on public.appointments(organization_id,recurrence_group_id);

commit;
