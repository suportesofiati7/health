begin;

create or replace function public.communication_render_template(template_body text, field_values jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare
  rendered text := coalesce(template_body, '');
  match text[];
  missing text[] := '{}';
  replacement text;
begin
  for match in select regexp_matches(rendered, '\\{\\{([a-zA-Z0-9_]+)\\}\\}', 'g') loop
    replacement := nullif(trim(coalesce(field_values ->> match[1], '')), '');
    if replacement is null then
      missing := array_append(missing, match[1]);
    else
      rendered := replace(rendered, '{{' || match[1] || '}}', replacement);
    end if;
  end loop;
  return jsonb_build_object('text', rendered, 'missing', (select coalesce(array_agg(distinct item order by item), '{}'::text[]) from unnest(missing) item));
end;
$$;
revoke all on function public.communication_render_template(text,jsonb) from public, anon;
grant execute on function public.communication_render_template(text,jsonb) to authenticated;

create or replace function private.reject_external_placeholders()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.direction = 'outbound' and new.visibility = 'external'
     and new.body ~ '\\{\\{[a-zA-Z0-9_]+\\}\\}' then
    raise exception 'communication_has_unresolved_placeholders';
  end if;
  return new;
end;
$$;
drop trigger if exists communication_external_placeholder_guard on public.communications;
create trigger communication_external_placeholder_guard before insert or update of body,direction,visibility on public.communications
for each row execute function private.reject_external_placeholders();

commit;
