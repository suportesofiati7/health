-- Financeiro: private owner-only financial records.
-- The email check is intentional defense-in-depth; RLS remains authoritative.
begin;

create or replace function private.finance_access(org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.memberships m where m.organization_id = org
      and m.user_id = auth.uid() and lower(m.email) = 'suportesofiati@gmail.com'
      and m.status = 'ativo' and m.role = 'proprietario')
    and private.has_role(org, array['proprietario']);
$$;
revoke all on function private.finance_access(uuid) from public, anon;
grant execute on function private.finance_access(uuid) to authenticated, service_role;

create table public.financial_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  patient_id uuid not null,
  procedure_name text not null default '',
  total_cents integer not null check(total_cents >= 0),
  due_on date,
  nota_fiscal_issued boolean not null default false,
  nota_fiscal_url text not null default '' check(length(nota_fiscal_url) <= 2000),
  nota_fiscal_path text not null default '',
  notes text not null default '' check(length(notes) <= 5000),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique(organization_id, patient_id, id),
  foreign key(organization_id, patient_id) references public.patients(organization_id, id)
);
create table public.financial_payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  record_id uuid not null,
  patient_id uuid not null,
  amount_cents integer not null check(amount_cents > 0),
  paid_on date not null default current_date,
  method text not null check(method in ('pix','cartao_credito','cartao_debito','dinheiro','transferencia','boleto','outro')),
  notes text not null default '' check(length(notes) <= 2000),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key(organization_id, patient_id, record_id) references public.financial_records(organization_id, patient_id, id)
);
create index financial_records_lookup on public.financial_records(organization_id, created_at desc);
create index financial_payments_record on public.financial_payments(organization_id, record_id, paid_on desc);
alter table public.financial_records enable row level security;
alter table public.financial_payments enable row level security;
revoke all on public.financial_records, public.financial_payments from anon, authenticated;
grant select, insert, update on public.financial_records, public.financial_payments to authenticated;
create policy finance_records_owner on public.financial_records for all to authenticated
  using(private.finance_access(organization_id)) with check(private.finance_access(organization_id) and created_by = auth.uid());
create policy finance_payments_owner on public.financial_payments for all to authenticated
  using(private.finance_access(organization_id)) with check(private.finance_access(organization_id) and created_by = auth.uid());

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values('finance-private','finance-private',false,8388608,array['application/pdf','image/jpeg','image/png'])
on conflict(id) do nothing;
create policy finance_file_read on storage.objects for select to authenticated
  using(bucket_id = 'finance-private' and private.finance_access((split_part(name,'/',1))::uuid));
create policy finance_file_insert on storage.objects for insert to authenticated
  with check(bucket_id = 'finance-private' and private.finance_access((split_part(name,'/',1))::uuid));
create policy finance_file_update on storage.objects for update to authenticated
  using(bucket_id = 'finance-private' and private.finance_access((split_part(name,'/',1))::uuid));

create trigger finance_record_audit after insert or update on public.financial_records
for each row execute function private.audit_change();
create trigger finance_payment_audit after insert or update on public.financial_payments
for each row execute function private.audit_change();
commit;
