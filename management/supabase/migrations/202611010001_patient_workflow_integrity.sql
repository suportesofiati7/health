begin;

-- Granular permissions must honor the same active, unrevoked session as roles.
create or replace function private.has_permission(org uuid, permission_area text, permission_action text)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_role(org, array['proprietario']) or exists (
    select 1 from public.memberships m join public.staff_permissions p
      on p.organization_id=m.organization_id and p.user_id=m.user_id
    join auth.sessions s on s.user_id=m.user_id and s.id::text=auth.jwt()->>'session_id'
    where m.organization_id=org and m.user_id=auth.uid() and m.status='ativo' and p.area=permission_area
      and not exists(select 1 from private.revoked_sessions r where r.id=s.id)
      and coalesce((auth.jwt()->>'exp')::numeric,0)>extract(epoch from now())
      and case permission_action
        when 'view' then p.can_view when 'create' then p.can_create when 'edit' then p.can_edit
        when 'finalize' then p.can_finalize when 'export' then p.can_export when 'share' then p.can_share
        when 'delete' then p.can_delete when 'manage' then p.can_manage when 'administer' then p.can_administer
        else false end
  );
$$;

-- Trusted Edge Functions can ask about the authenticated caller's permissions,
-- without exposing service credentials or using a service-role write as auth.
create function public.can_patient_operation(permission_area text, permission_action text)
returns boolean language sql stable security invoker set search_path='' as $$
  select private.has_permission('a783bd4c-f253-4a94-9365-75c6f1000001',permission_area,permission_action);
$$;
revoke all on function public.can_patient_operation(text,text) from public,anon;
grant execute on function public.can_patient_operation(text,text) to authenticated;

-- Keep existing records intact. Reject new/edited cross-patient links even
-- when both patients belong to the same organisation. Trigger arguments are
-- installed below, never accepted from a client.
create function private.patient_relationship_guard() returns trigger
language plpgsql security definer set search_path='' as $$
declare reference_id uuid; reference_patient uuid; i integer; row_data jsonb := to_jsonb(new);
begin
  for i in 0..tg_nargs/2-1 loop
    reference_id := nullif(row_data->>tg_argv[i*2],'')::uuid;
    if reference_id is not null then
      execute format('select patient_id from public.%I where organization_id=$1 and id=$2 for update',tg_argv[i*2+1])
        into reference_patient using new.organization_id,reference_id;
      if reference_patient is distinct from new.patient_id then
        raise exception using errcode='23514',message='patient_relationship_mismatch';
      end if;
    end if;
  end loop;
  return new;
end $$;
revoke all on function private.patient_relationship_guard() from public,anon,authenticated;
create trigger patient_relationship_guard before insert or update on public.clinical_procedures for each row
  execute function private.patient_relationship_guard('appointment_id','appointments','plan_id','treatment_plans');
create trigger patient_relationship_guard before insert or update on public.clinical_photos for each row
  execute function private.patient_relationship_guard('clinical_procedure_id','clinical_procedures');
create trigger patient_relationship_guard before insert or update on public.consents for each row
  execute function private.patient_relationship_guard('clinical_procedure_id','clinical_procedures');
create trigger patient_relationship_guard before insert or update on public.follow_ups for each row
  execute function private.patient_relationship_guard('clinical_procedure_id','clinical_procedures','appointment_id','appointments');
create trigger patient_relationship_guard before insert or update on public.adverse_events for each row
  execute function private.patient_relationship_guard('clinical_procedure_id','clinical_procedures');
create trigger patient_relationship_guard before insert or update on public.patient_portal_actions for each row
  execute function private.patient_relationship_guard('clinical_procedure_id','clinical_procedures','appointment_id','appointments');

-- Finalization is distinct from permission to prepare/edit a draft. A UI
-- checkbox is not consent evidence, and an obligatory lot cannot be omitted
-- by calling the API directly.
create or replace function private.enforce_procedure_safety() returns trigger
language plpgsql security definer set search_path='' as $$
declare catalogue public.procedures%rowtype; evidence public.consents%rowtype;
begin
  if new.status='finalizado' and (tg_op='INSERT' or old.status is distinct from 'finalizado') then
    if auth.uid() is not null and not private.has_permission(new.organization_id,'procedures','finalize') then
      raise exception using errcode='42501',message='procedure_finalize_denied';
    end if;
    if new.history_only then return new; end if;
    select * into catalogue from public.procedures where organization_id=new.organization_id and id=new.procedure_id;
    if catalogue.required_consents ? 'procedimento' then
      if new.consent_status<>'aceito' then raise exception using errcode='23514',message='procedure_consent_required'; end if;
      select * into evidence from public.consents c
        where c.organization_id=new.organization_id and c.patient_id=new.patient_id and c.procedure_id=new.procedure_id
          and c.kind='procedimento' and (c.clinical_procedure_id=new.id or c.clinical_procedure_id is null)
        order by c.created_at desc,c.id desc limit 1;
      if evidence.id is null or evidence.status<>'aceito' or evidence.accepted_at is null
        or (coalesce(catalogue.consent_template_version,'')<>'' and evidence.template_version<>catalogue.consent_template_version) then
        raise exception using errcode='23514',message='procedure_consent_evidence_required';
      end if;
    end if;
    if catalogue.lot_required and not exists(select 1 from public.product_usages u
      where u.organization_id=new.organization_id and u.clinical_procedure_id=new.id) then
      raise exception using errcode='23514',message='procedure_lot_required';
    end if;
  end if;
  return new;
end $$;

-- These records previously had no automatic audit event at all. Audit rows
-- carry identifiers only, matching the existing restricted audit schema.
do $$ declare table_name text; begin
  foreach table_name in array array['patient_health_history','clinical_procedures','clinical_photos','consents','follow_ups','adverse_events','treatment_plans','treatment_plan_items','product_usages','inventory_movements','patient_portal_actions','patient_portal_shares'] loop
    execute format('create trigger audit_change after insert or update on public.%I for each row execute function private.audit_change()',table_name);
  end loop;
end $$;

-- Stable per-item session keys make scheduling retry-safe and serialise two
-- concurrent clicks on the same plan. Existing appointments are not rewritten.
alter table public.appointments add column plan_item_id uuid, add column plan_session_no integer;
alter table public.appointments add constraint appointments_plan_item_fk foreign key(organization_id,plan_item_id) references public.treatment_plan_items(organization_id,id);
create unique index appointments_plan_session_unique on public.appointments(organization_id,plan_item_id,plan_session_no)
  where plan_item_id is not null and status not in ('cancelado','reagendado','faltou');
create or replace function public.schedule_treatment_plan(p_plan uuid, p_start_date date default current_date + 1, p_start_time time default '09:00')
returns integer
language plpgsql
security definer
set search_path = public, private
as $$
declare plan_row record; item_row record; procedure_row record; session_no integer; created_count integer := 0; recurrence_id uuid;
begin
  select * into plan_row from public.treatment_plans where id = p_plan for update;
  if plan_row.id is null or not private.has_permission(plan_row.organization_id,'treatment_plans','edit') or not private.has_permission(plan_row.organization_id,'appointments','create') then raise exception using errcode='42501', message='treatment_plan_access_denied'; end if;
  if plan_row.status not in ('planejado','em_andamento') then raise exception 'treatment_plan_not_schedulable'; end if;
  for item_row in select * from public.treatment_plan_items where organization_id = plan_row.organization_id and plan_id = plan_row.id and archived_at is null order by sequence_no loop
    select * into procedure_row from public.procedures where organization_id = plan_row.organization_id and id = item_row.procedure_id and active;
    if procedure_row.id is null then continue; end if;
    recurrence_id := gen_random_uuid();
    for session_no in 0..greatest(item_row.sessions,1)-1 loop
      if exists(select 1 from public.appointments a where a.organization_id=plan_row.organization_id and a.plan_item_id=item_row.id and a.plan_session_no=session_no+1 and a.status not in ('cancelado','reagendado','faltou')) then continue; end if;
      insert into public.appointments(organization_id,patient_id,professional_id,procedure_id,procedure_snapshot,plan_item_id,plan_session_no,recurrence_group_id,recurrence_index,starts_at,ends_at,status,label,created_by)
      values(plan_row.organization_id,plan_row.patient_id,plan_row.responsible_user,procedure_row.id,to_jsonb(procedure_row),item_row.id,session_no+1,recurrence_id,session_no+1,
        ((p_start_date + session_no * coalesce(nullif(procedure_row.interval_days,0),nullif(procedure_row.followup_days,0),30)) + p_start_time) at time zone 'America/Sao_Paulo',
        (((p_start_date + session_no * coalesce(nullif(procedure_row.interval_days,0),nullif(procedure_row.followup_days,0),30)) + p_start_time) at time zone 'America/Sao_Paulo') + make_interval(mins => procedure_row.default_duration),
        'agendado',procedure_row.name,auth.uid());
      created_count := created_count + 1;
    end loop;
  end loop;
  update public.treatment_plans set status='em_andamento', updated_at=now() where id=plan_row.id;
  return created_count;
end;
$$;
revoke all on function public.schedule_treatment_plan(uuid,date,time) from public, anon;
grant execute on function public.schedule_treatment_plan(uuid,date,time) to authenticated;


commit;
