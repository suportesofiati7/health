-- A converted legacy enquiry is permanently linked to its patient.
-- Enforce this at RLS level as well as the trigger, so an UPDATE that affects
-- zero rows cannot be mistaken for a successful unlink by a client.
drop policy if exists enquiry_update on public.enquiries;
create policy enquiry_update
on public.enquiries
for update
to authenticated
using (
  status <> 'convertido'
  and private.has_permission(organization_id,'intake_forms','edit')
)
with check (
  status <> 'convertido'
  and private.has_permission(organization_id,'intake_forms','edit')
);
