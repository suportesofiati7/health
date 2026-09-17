begin;

-- `convert_enquiry` was the first-generation enquiry workflow. The current
-- management UI uses `convert_public_intake` instead, so this old privileged
-- entry point must not remain callable by browser sessions.
revoke all on function public.convert_enquiry(uuid, uuid)
  from public, anon, authenticated;

-- Keep the action-centre RPC's privileged execution explicit and make name
-- resolution deterministic. Every object referenced by the function body is
-- already schema-qualified, so an empty search path is safe here.
alter function public.generate_action_centre_tasks()
  set search_path = '';

commit;
