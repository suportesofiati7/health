begin;

-- Action-centre metadata stays additive: old tasks remain valid manual tasks.
alter table public.tasks add column if not exists category text not null default 'operacional';
alter table public.tasks add column if not exists source_type text not null default 'manual';
alter table public.tasks add column if not exists source_id uuid;
alter table public.tasks drop constraint if exists tasks_category_valid;
alter table public.tasks add constraint tasks_category_valid check(category in ('clinico','operacional','comunicacao'));
alter table public.tasks drop constraint if exists tasks_source_type_valid;
alter table public.tasks add constraint tasks_source_type_valid check(source_type in ('manual','appointment','clinical_procedure','follow_up','adverse_event'));
create unique index if not exists tasks_action_source_unique
  on public.tasks(organization_id,source_type,source_id)
  where source_id is not null and source_type <> 'manual';
create index if not exists tasks_action_centre_due
  on public.tasks(organization_id,status,category,due_at);

-- Called by the UI when the action centre opens. It is deliberately local and
-- idempotent: no external API, queue, cron or paid provider is required.
create or replace function public.generate_action_centre_tasks()
returns integer
language plpgsql
security definer
set search_path = public, private
as $$
declare
  created_count integer := 0;
  inserted_count integer := 0;
  actor uuid := auth.uid();
begin
  if actor is null or not private.has_role('a783bd4c-f253-4a94-9365-75c6f1000001', array['proprietario','profissional','recepcao']) then
    raise exception 'not_authorized';
  end if;

  insert into public.tasks(organization_id,patient_id,title,due_at,priority,status,created_by,category,source_type,source_id)
  select a.organization_id, a.patient_id,
    case when a.label <> '' then 'Pós-atendimento · ' || a.label else 'Pós-atendimento · verificar evolução' end,
    a.starts_at + interval '2 days', 'normal', 'pendente', actor, 'clinico', 'appointment', a.id
  from public.appointments a
  where a.organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'
    and a.status = 'concluido'
    and a.starts_at >= now() - interval '45 days'
  on conflict (organization_id,source_type,source_id) where source_id is not null and source_type <> 'manual' do nothing;
  get diagnostics inserted_count = row_count;
  created_count := created_count + inserted_count;

  insert into public.tasks(organization_id,patient_id,title,due_at,priority,status,created_by,category,source_type,source_id)
  select cp.organization_id, cp.patient_id,
    'Retorno de procedimento · ' || coalesce(p.name, 'avaliação'),
    (cp.followup_due::text || ' 09:00:00-03')::timestamptz, 'normal', 'pendente', actor, 'clinico', 'clinical_procedure', cp.id
  from public.clinical_procedures cp
  left join public.procedures p on p.organization_id = cp.organization_id and p.id = cp.procedure_id
  where cp.organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'
    and cp.status = 'finalizado'
    and cp.followup_due is not null
  on conflict (organization_id,source_type,source_id) where source_id is not null and source_type <> 'manual' do nothing;
  get diagnostics inserted_count = row_count;
  created_count := created_count + inserted_count;

  insert into public.tasks(organization_id,patient_id,title,due_at,priority,status,created_by,category,source_type,source_id)
  select f.organization_id, f.patient_id, 'Retorno clínico pendente',
    (f.expected_on::text || ' 09:00:00-03')::timestamptz, case when f.status = 'vencido' then 'alta' else 'normal' end,
    'pendente', actor, 'clinico', 'follow_up', f.id
  from public.follow_ups f
  where f.organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'
    and f.status in ('aguardando_agendamento','vencido')
  on conflict (organization_id,source_type,source_id) where source_id is not null and source_type <> 'manual' do nothing;
  get diagnostics inserted_count = row_count;
  created_count := created_count + inserted_count;

  insert into public.tasks(organization_id,patient_id,title,due_at,priority,status,created_by,category,source_type,source_id)
  select e.organization_id, e.patient_id, 'Acompanhar intercorrência',
    coalesce((e.followup_deadline::text || ' 09:00:00-03')::timestamptz, now()), 'alta', 'pendente', actor, 'clinico', 'adverse_event', e.id
  from public.adverse_events e
  where e.organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'
    and e.status = 'em_acompanhamento'
  on conflict (organization_id,source_type,source_id) where source_id is not null and source_type <> 'manual' do nothing;
  get diagnostics inserted_count = row_count;
  created_count := created_count + inserted_count;

  return created_count;
end;
$$;

revoke all on function public.generate_action_centre_tasks() from public, anon;
grant execute on function public.generate_action_centre_tasks() to authenticated;

commit;
