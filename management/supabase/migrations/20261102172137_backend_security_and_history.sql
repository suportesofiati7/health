begin;

-- The catalogue view must apply the caller's underlying procedures RLS.
alter view public.procedure_catalog_quality set (security_invoker = true);
revoke all on public.procedure_catalog_quality from public, anon;
grant select on public.procedure_catalog_quality to authenticated;

-- All objects in the scheduler are schema-qualified; exclude writable schemas.
alter function public.schedule_treatment_plan(uuid, date, time without time zone)
  set search_path = '';

-- An early manual deployment recorded the correct version with the wrong name.
-- The follow-up RPC was restored by 202611010008; do not replay old SQL.
do $$
begin
  if to_regclass('supabase_migrations.schema_migrations') is not null then
    update supabase_migrations.schema_migrations
    set name = 'follow_up_status_rpc'
    where version = '202609210001' and name = 'procedure_catalog_images';
  end if;
end $$;

commit;
