begin;

-- Keep server-side placeholder metadata aligned with the client renderer.
-- Older models use {campo}; newer models use {{campo}}.
create or replace function public.communication_missing_placeholders(template_body text, field_values jsonb)
returns text[] language sql immutable set search_path = '' as $$
  select coalesce(array_agg(distinct coalesce(match[1], match[2]) order by coalesce(match[1], match[2])), '{}'::text[])
  from regexp_matches(coalesce(template_body,''), '\{\{([a-zA-Z0-9_]+)\}\}|\{([a-zA-Z0-9_]+)\}', 'g') as match
  where nullif(trim(coalesce(field_values ->> coalesce(match[1], match[2]),'')),'') is null;
$$;

create or replace function public.communication_render_template(template_body text, field_values jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare
  rendered text := coalesce(template_body, '');
  match text[];
  key text;
  replacement text;
begin
  for match in select regexp_matches(rendered, '\{\{([a-zA-Z0-9_]+)\}\}|\{([a-zA-Z0-9_]+)\}', 'g') loop
    key := coalesce(match[1], match[2]);
    replacement := coalesce(field_values ->> key, '{{' || key || '}}');
    rendered := replace(rendered, '{{' || key || '}}', replacement);
    rendered := replace(rendered, '{' || key || '}', replacement);
  end loop;
  return jsonb_build_object('text', rendered, 'missing', public.communication_missing_placeholders(template_body, field_values));
end;
$$;

commit;
