begin;
grant usage on schema private to authenticated, service_role;
grant execute on function private.valid_cpf(text), private.valid_cns(text) to authenticated, service_role;
commit;
