begin;

-- Supabase's Index Advisor function depends on HypoPG. Enable it where the
-- hosted extension is available; local PostgreSQL test images may not include
-- the optional package.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'hypopg') then
    create extension if not exists hypopg with schema extensions;
  end if;
end $$;

commit;
