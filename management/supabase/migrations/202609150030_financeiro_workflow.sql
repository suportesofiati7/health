-- Additive finance workflow fields. Existing financial history is preserved.
begin;
alter table public.financial_records
  add column if not exists status text not null default 'pendente',
  add column if not exists receipt_number text not null default '',
  add column if not exists nf_number text not null default '',
  add column if not exists nf_issued_on date,
  add column if not exists nf_amount_cents integer,
  add column if not exists corrected_from uuid,
  add column if not exists cancelled_reason text not null default '';
alter table public.financial_payments
  add column if not exists status text not null default 'recebido',
  add column if not exists refunded_on date,
  add column if not exists refund_reason text not null default '';
alter table public.financial_records add constraint financial_status_valid
  check(status in ('pendente','parcial','pago','vencido','cancelado','corrigido'));
alter table public.financial_payments add constraint financial_payment_status_valid
  check(status in ('recebido','estornado','cancelado'));
alter table public.financial_records add constraint financial_nf_amount_valid
  check(nf_amount_cents is null or nf_amount_cents >= 0);
create unique index if not exists financial_receipt_number_unique
  on public.financial_records(organization_id, receipt_number) where receipt_number <> '';
create trigger financial_records_stamp before insert or update on public.financial_records
for each row execute function private.stamp();
commit;
