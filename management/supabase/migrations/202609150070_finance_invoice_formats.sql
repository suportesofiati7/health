begin;

update storage.buckets
set allowed_mime_types = array[
  'application/pdf', 'application/xml', 'text/xml', 'image/jpeg', 'image/png'
]
where id = 'finance-private';

commit;
