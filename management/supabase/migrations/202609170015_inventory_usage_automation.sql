begin;

create or replace function private.record_inventory_consumption()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  product_id_value uuid;
  unit_cost_value integer;
begin
  select product_id, unit_cost_cents into product_id_value, unit_cost_value
  from public.product_lots where organization_id = new.organization_id and id = new.lot_id;
  if product_id_value is null then
    raise exception using errcode = '23503', message = 'inventory_lot_not_found';
  end if;
  insert into public.inventory_movements
    (organization_id, product_id, lot_id, movement_type, quantity, unit, unit_cost_cents, reason, clinical_procedure_id, created_by)
  values
    (new.organization_id, product_id_value, new.lot_id, 'consumo', coalesce(new.quantity, 1), new.unit, unit_cost_value,
     'Consumo automático vinculado ao procedimento clínico', new.clinical_procedure_id, new.created_by);
  return new;
end;
$$;

drop trigger if exists product_usage_inventory_consumption on public.product_usages;
create trigger product_usage_inventory_consumption
after insert on public.product_usages
for each row execute function private.record_inventory_consumption();

commit;
