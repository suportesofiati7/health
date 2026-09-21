begin;

alter table public.procedures
  add column if not exists image_url text not null default '';

comment on column public.procedures.image_url is
  'Optional service catalogue image URL. Empty values use the management app service-specific image suggestion.';

commit;
