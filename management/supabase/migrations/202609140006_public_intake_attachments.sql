begin;

-- Public intake uploads may be any file type, but remain private and bounded.
-- The Edge Function validates count and size before using the service role.
alter table public.public_intake_files
  drop constraint if exists public_intake_files_kind_check;
alter table public.public_intake_files
  add constraint public_intake_files_kind_check
  check (kind in ('identity','payment','attachment','marketing_authorization'));
alter table public.public_intake_files add column if not exists original_name text not null default '';
alter table public.public_intake_files add column if not exists field_name text not null default 'attachment';

-- MIME is metadata only; the bucket is private and never serves arbitrary files publicly.
update storage.buckets
set allowed_mime_types = null, file_size_limit = 10485760
where id = 'intake-private';

commit;
