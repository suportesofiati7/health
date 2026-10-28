begin;

-- Every conversion route uses the same consent projection. Retain the exact
-- choice and intake reference; never infer acceptance from a patient's existence.
alter table public.consents
  add column if not exists source_intake_id uuid references public.public_intakes(id),
  add column if not exists source_field text,
  add column if not exists authorization_choice text;
create unique index if not exists consent_intake_field_unique
  on public.consents(source_intake_id, source_field)
  where source_intake_id is not null;

create or replace function private.sync_intake_consents()
returns trigger language plpgsql security definer set search_path='' as $$
declare
  actor uuid;
  field text;
  choice text;
  consent_kind text;
  accepted boolean;
  selected text;
begin
  if new.patient_id is null then return new; end if;
  select coalesce(new.converted_by, new.reviewed_by, m.user_id) into actor
    from public.memberships m where m.organization_id=new.organization_id
    and m.role='proprietario' and m.status='ativo' order by m.user_id limit 1;
  if actor is null then raise exception 'patient_author'; end if;
  for field, choice in select key, value from jsonb_each_text(new.payload) loop
    selected := null;
    consent_kind := case field
      when 'lgpd_personal_data_consent' then 'privacidade'
      when 'lgpd_sensitive_data_consent' then 'privacidade'
      when 'technical_image_authorisation' then 'fotografia_clinica'
      when 'marketing_image_authorisation' then 'publicacao_marketing'
      when 'promotional_communication' then 'comunicacao'
      when 'booking_fee_acknowledgement' then 'reserva'
      else case when field like 'accepted\_term\_%' escape '\' then 'procedimento' end end;
    if consent_kind is null then continue; end if;
    if consent_kind='procedimento' then
      selected := substr(field, length('accepted_term_')+1);
      if jsonb_typeof(new.payload->'selected_procedures') <> 'array'
        or not coalesce((new.payload->'selected_procedures') ? selected, false) then continue; end if;
    end if;
    accepted := choice='yes' or (field='marketing_image_authorisation' and choice in ('non_identifiable','partial_approval','full_approval'));
    if not accepted and choice <> 'no' then continue; end if;
    insert into public.consents(organization_id,patient_id,kind,template_version,status,method,accepted_at,created_by,language,source,source_intake_id,source_field,authorization_choice,patient_answers)
      values(new.organization_id,new.patient_id,consent_kind,new.form_version,
        case when accepted then 'aceito' else 'recusado' end,'formulario_publico',
        case when accepted then new.submitted_at end,actor,new.language,'formulario_publico',new.id,field,choice,
        jsonb_build_object('intake_id',new.id,'field',field,'choice',choice,'form_version',new.form_version,'procedure_key',selected))
      on conflict (source_intake_id,source_field) where source_intake_id is not null do nothing;
  end loop;
  return new;
end $$;
revoke all on function private.sync_intake_consents() from public,anon,authenticated;
create trigger public_intake_consents after insert or update of patient_id on public.public_intakes
  for each row execute function private.sync_intake_consents();

-- Backfill recorded choices for previously linked intakes through the same path.
update public.public_intakes set patient_id=patient_id where patient_id is not null;

-- Retire the two shipped demo services so finance offers real services only.
update public.procedures set active=false, review_status='arquivado',
  availability=availability || '{"booking_visible":false,"public_visible":false}'::jsonb
where name in ('TESTE — Limpeza facial de conferência','TESTE — Avaliação inicial de conferência');

-- A catalogue change and its version snapshot must commit or fail together.
create or replace function private.version_procedure_catalogue()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if tg_when='BEFORE' then
    new.catalog_version := case when tg_op='UPDATE' then greatest(old.catalog_version,
      coalesce((select max(v.version) from public.procedure_versions v where v.procedure_id=new.id),0))+1 else 1 end;
    return new;
  end if;
  insert into public.procedure_versions(organization_id,procedure_id,version,snapshot,created_by)
    values(new.organization_id,new.id,new.catalog_version,to_jsonb(new),coalesce(auth.uid(),new.created_by));
  return new;
end $$;
revoke all on function private.version_procedure_catalogue() from public,anon,authenticated;
create trigger procedure_catalogue_version before insert or update on public.procedures
  for each row execute function private.version_procedure_catalogue();
create trigger procedure_catalogue_snapshot after insert or update on public.procedures
  for each row execute function private.version_procedure_catalogue();

commit;
