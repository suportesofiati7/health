begin;

alter table public.products
  add column if not exists reorder_level numeric not null default 0 check(reorder_level >= 0),
  add column if not exists unit_cost_cents integer check(unit_cost_cents is null or unit_cost_cents >= 0),
  add column if not exists supplier text not null default '';
alter table public.product_lots
  add column if not exists unit_cost_cents integer check(unit_cost_cents is null or unit_cost_cents >= 0);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), product_id uuid not null,
  lot_id uuid, movement_type text not null check(movement_type in ('entrada','consumo','ajuste','perda','devolucao')),
  quantity numeric not null check(quantity > 0), unit text not null default '', unit_cost_cents integer check(unit_cost_cents is null or unit_cost_cents >= 0), reason text not null default '',
  clinical_procedure_id uuid, created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(),
  foreign key(organization_id,product_id) references public.products(organization_id,id), foreign key(organization_id,lot_id) references public.product_lots(organization_id,id), foreign key(organization_id,clinical_procedure_id) references public.clinical_procedures(organization_id,id)
);
alter table public.inventory_movements enable row level security;
revoke all on public.inventory_movements from anon, authenticated;
grant select, insert on public.inventory_movements to authenticated;
create policy inventory_read on public.inventory_movements for select to authenticated using(private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura']));
create policy inventory_write on public.inventory_movements for insert to authenticated with check(private.has_role(organization_id,array['proprietario','profissional']) and created_by=auth.uid());

alter table public.financial_records
  add column if not exists discount_cents integer not null default 0 check(discount_cents >= 0),
  add column if not exists cost_cents integer check(cost_cents is null or cost_cents >= 0),
  add column if not exists package_name text not null default '',
  add column if not exists installment_number integer check(installment_number is null or installment_number > 0),
  add column if not exists installment_total integer check(installment_total is null or installment_total > 0);

create table if not exists public.patient_portal_actions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), patient_id uuid not null,
  action_type text not null check(action_type in ('confirmar_agendamento','solicitar_reagendamento','cancelar_agendamento','solicitar_retorno','reportar_sintoma')),
  appointment_id uuid, clinical_procedure_id uuid, notes text not null default '', status text not null default 'pendente' check(status in ('pendente','em_analise','concluida','recusada')),
  created_at timestamptz not null default now(), resolved_at timestamptz, resolved_by uuid references auth.users(id),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id), foreign key(organization_id,appointment_id) references public.appointments(organization_id,id), foreign key(organization_id,clinical_procedure_id) references public.clinical_procedures(organization_id,id)
);
alter table public.patient_portal_actions enable row level security;
revoke all on public.patient_portal_actions from anon, authenticated;
grant select, insert, update on public.patient_portal_actions to authenticated;
create policy portal_actions_staff on public.patient_portal_actions for all to authenticated using(private.has_role(organization_id,array['proprietario','profissional','recepcao'])) with check(private.has_role(organization_id,array['proprietario','profissional','recepcao']));

create index if not exists inventory_product_idx on public.inventory_movements(organization_id,product_id,created_at desc);
create index if not exists portal_actions_patient_idx on public.patient_portal_actions(organization_id,patient_id,status,created_at desc);

commit;
