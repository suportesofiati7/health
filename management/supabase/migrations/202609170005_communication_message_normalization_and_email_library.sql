begin;

-- Older seed migrations used '\\n' inside ordinary SQL strings. PostgreSQL
-- stored those as two characters, which WhatsApp then displayed literally.
-- This deployment-time cleanup is not a user edit; do not create a history
-- row because auth.uid() is null while migrations run.
alter table public.communication_templates disable trigger communication_template_version_snapshot;
update public.communication_templates
set subject = replace(subject, E'\\n', E'\n'),
    body = replace(body, E'\\n', E'\n'),
    updated_at = now()
where subject like '%' || E'\\n' || '%'
   or body like '%' || E'\\n' || '%';

-- Give every reusable external WhatsApp model an equivalent email model.
-- The same approved wording is a safe starting point; Franciele can edit or
-- clone each one in the composer, and subjects remain channel-specific.
insert into public.communication_templates
  (organization_id, name, category, channel, variant, subject, body,
   sender_mode, sensitive, description, usage, availability, keywords, active)
select organization_id,
       name || ' · Email',
       category,
       'email',
       variant,
       name,
       body,
       sender_mode,
       sensitive,
       coalesce(description, '') || ' Versão para email.',
       array['email']::text[],
       coalesce(availability, 'team'),
       coalesce(keywords, '{}'::text[]) || array['email']::text[],
       true
from public.communication_templates source
where source.channel = 'whatsapp'
  and source.active = true
  and source.deleted_at is null
  and source.name not like '% · Email'
on conflict (organization_id, name, variant, channel) do update
set subject = excluded.subject,
    body = excluded.body,
    description = excluded.description,
    usage = excluded.usage,
    keywords = excluded.keywords,
    deleted_at = null,
    active = true;

alter table public.communication_templates enable trigger communication_template_version_snapshot;

commit;
