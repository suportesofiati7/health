begin;

create or replace function private.finance_payment_guard()
returns trigger language plpgsql security definer set search_path='' as $$
declare total integer; received integer;
begin
  select total_cents into total
    from public.financial_records
    where id=new.record_id and organization_id=new.organization_id and patient_id=new.patient_id;
  if total is null then raise exception 'invalid_financial_record'; end if;
  if new.status='recebido' then
    select coalesce(sum(amount_cents),0) into received
      from public.financial_payments
      where record_id=new.record_id and organization_id=new.organization_id
        and status='recebido' and (tg_op <> 'UPDATE' or id<>new.id);
    if received + new.amount_cents > total then
      raise exception 'finance_payment_over_total';
    end if;
  end if;
  return new;
end $$;

create or replace function private.finance_payment_status()
returns trigger language plpgsql security definer set search_path='' as $$
declare total integer; received integer; current_status text;
begin
  select total_cents, status into total, current_status
    from public.financial_records where id=new.record_id and organization_id=new.organization_id;
  select coalesce(sum(amount_cents),0) into received
    from public.financial_payments where record_id=new.record_id and status='recebido';
  if current_status not in ('cancelado','corrigido') then
    update public.financial_records set status=case
      when received >= total then 'pago'
      when received > 0 then 'parcial'
      when due_on is not null and due_on < current_date then 'vencido'
      else 'pendente' end
      where id=new.record_id and organization_id=new.organization_id;
  end if;
  return new;
end $$;

drop trigger if exists finance_payment_guard on public.financial_payments;
create trigger finance_payment_guard before insert or update on public.financial_payments
for each row execute function private.finance_payment_guard();
drop trigger if exists finance_payment_status on public.financial_payments;
create trigger finance_payment_status after insert or update on public.financial_payments
for each row execute function private.finance_payment_status();

revoke all on function private.finance_payment_guard(), private.finance_payment_status() from public, anon, authenticated;
grant execute on function private.finance_payment_guard(), private.finance_payment_status() to service_role;
commit;
