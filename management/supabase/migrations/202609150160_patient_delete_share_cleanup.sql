begin;

-- Portal shares are a direct patient dependency. Clean them before any
-- patient deletion path, including future administrative maintenance queries.
create or replace function private.cleanup_patient_portal_shares()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.patient_portal_shares where patient_id = old.id;
  return old;
end $$;

drop trigger if exists patients_portal_shares_cleanup on public.patients;
create trigger patients_portal_shares_cleanup
before delete on public.patients
for each row execute function private.cleanup_patient_portal_shares();

commit;
