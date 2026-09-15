begin;

-- Expanded clinic access catalogue. The stored keys are deliberately stable;
-- translated names and the human descriptions live in the application.
alter table public.memberships drop constraint if exists memberships_role_check;
alter table public.memberships add constraint memberships_role_check check (role in (
  'proprietario', 'profissional', 'recepcao', 'leitura',
  'gestor_clinica', 'coordenador_operacional', 'medico', 'enfermeiro',
  'fisioterapeuta', 'nutricionista', 'psicologo', 'assistente_clinico',
  'secretaria', 'financeiro', 'auditor', 'marketing', 'suporte_ti',
  'consultor_externo', 'fornecedor'
));

create table if not exists public.staff_role_catalog (
  role text primary key,
  display_order integer not null default 100,
  internal boolean not null default true,
  description_pt text not null default '',
  description_en text not null default ''
);
alter table public.staff_role_catalog enable row level security;
revoke all on public.staff_role_catalog from anon, authenticated;
grant select on public.staff_role_catalog to authenticated;
drop policy if exists staff_role_catalog_read on public.staff_role_catalog;
create policy staff_role_catalog_read on public.staff_role_catalog
  for select to authenticated using (private.has_role(
    'a783bd4c-f253-4a94-9365-75c6f1000001'::uuid,
    array['proprietario','profissional','recepcao','leitura']
  ));

insert into public.staff_role_catalog(role,display_order,internal,description_pt,description_en) values
('proprietario',10,true,'Proprietária/dona: acesso total, pessoas, configurações, auditoria, dados e continuidade.','Owner: full access to people, settings, audit, data and continuity.'),
('suporte_ti',20,false,'Desenvolvimento e suporte técnico: deve ser atribuído como proprietário somente pela Sofiati.','Software development and technical support; assign as owner only by Sofiati.'),
('gestor_clinica',30,true,'Gestão clínica e operacional: coordena agenda, qualidade, processos e indicadores; sem administração de proprietários.','Clinical and operations manager: coordinates schedule, quality, processes and metrics; no owner administration.'),
('profissional',40,true,'Profissional de saúde autorizado a avaliar, registrar, tratar, finalizar e acompanhar o cuidado.','Authorized healthcare professional for assessment, records, treatment, finalization and follow-up.'),
('medico',41,true,'Médico responsável por avaliação, diagnóstico dentro da habilitação, prescrição e supervisão.','Physician responsible for assessment, diagnosis within scope, prescribing and supervision.'),
('enfermeiro',42,true,'Enfermagem: triagem, cuidados, registros e acompanhamento dentro da habilitação.','Nursing: triage, care, records and follow-up within scope.'),
('fisioterapeuta',43,true,'Fisioterapia: avaliação e registros dos atendimentos de sua responsabilidade.','Physiotherapist: assessment and records for assigned care.'),
('nutricionista',44,true,'Nutrição: avaliação, plano e acompanhamento nutricional.','Nutritionist: nutrition assessment, plans and follow-up.'),
('psicologo',45,true,'Psicologia: registros e acompanhamento psicológico autorizado.','Psychologist: authorized psychological records and follow-up.'),
('assistente_clinico',50,true,'Assistente clínico: prepara atendimento, coleta dados administrativos e apoia o profissional; sem finalizar clínica.','Clinical assistant: prepares visits and supports professionals; cannot finalize clinical records.'),
('recepcao',60,true,'Recepção: pacientes, contatos, agenda, formulários e comunicação operacional.','Reception: patients, contacts, scheduling, forms and operational communication.'),
('secretaria',61,true,'Secretaria: cadastro, agenda, documentos administrativos e comunicação.','Secretary: registration, scheduling, administrative documents and communication.'),
('coordenador_operacional',62,true,'Coordenação operacional: agenda, fluxo de atendimento, tarefas e equipe do dia.','Operations coordinator: scheduling, workflow, tasks and daily team coordination.'),
('financeiro',70,true,'Financeiro: cobranças, pagamentos e conciliação quando liberados em módulo financeiro próprio.','Finance: charges, payments and reconciliation when enabled in the finance module.'),
('auditor',80,false,'Auditoria/qualidade: leitura de dados autorizados e trilhas; sem edição clínica.','Audit/quality: read authorized data and trails; no clinical editing.'),
('marketing',90,false,'Marketing: somente dados e materiais explicitamente compartilhados; sem prontuário clínico.','Marketing: only explicitly shared data and materials; no clinical record.'),
('consultor_externo',100,false,'Consultor externo: acesso temporário e mínimo, apenas ao escopo compartilhado.','External consultant: temporary, minimum access to explicitly shared scope.'),
('fornecedor',110,false,'Fornecedor: acesso temporário a tarefas ou suporte sem dados clínicos por padrão.','Vendor: temporary task/support access with no clinical data by default.'),
('leitura',120,true,'Consulta administrativa: leitura limitada de cadastro, agenda e relatórios permitidos.','Administrative read-only: limited reading of patient identity, schedule and allowed reports.')
on conflict (role) do update set display_order=excluded.display_order, internal=excluded.internal,
  description_pt=excluded.description_pt, description_en=excluded.description_en;

-- Treat aliases as their least-surprise operational group for all legacy RLS
-- policies. Owner and software support are intentionally the only full-access
-- group; the owner invite gate is enforced in the staff Edge Function below.
create or replace function private.role_in_group(candidate text, requested text[])
returns boolean language sql immutable set search_path = '' as $$
  select exists (
    select 1 from unnest(requested) requested_role
    where candidate = requested_role
      or (requested_role = 'proprietario' and candidate in ('proprietario','suporte_ti'))
      or (requested_role = 'profissional' and candidate in ('profissional','medico','enfermeiro','fisioterapeuta','nutricionista','psicologo'))
      or (requested_role = 'recepcao' and candidate in ('gestor_clinica','recepcao','secretaria','coordenador_operacional'))
      or (requested_role = 'leitura' and candidate in ('leitura','financeiro','auditor','marketing','consultor_externo','fornecedor'))
  );
$$;
revoke all on function private.role_in_group(text,text[]) from public, anon;
grant execute on function private.role_in_group(text,text[]) to authenticated, service_role;

create or replace function private.has_role(org uuid, roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.memberships m
    join auth.sessions s on s.user_id=m.user_id
    where m.organization_id=org and m.user_id=auth.uid()
    and m.status='ativo' and private.role_in_group(m.role, roles)
    and s.id::text=auth.jwt()->>'session_id'
    and not exists(select 1 from private.revoked_sessions r where r.id=s.id)
    and coalesce((auth.jwt()->>'exp')::numeric,0)>extract(epoch from now()))
$$;
revoke all on function private.has_role(uuid,text[]) from public, anon;
grant execute on function private.has_role(uuid,text[]) to authenticated, service_role;

-- Defaults are applied to new invitations and when an owner changes a role.
-- The owner override in has_permission remains authoritative for full owners.
create or replace function private.seed_staff_permissions()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  a record;
  v boolean;
  c boolean;
  e boolean;
  f boolean;
  x boolean;
  s boolean;
begin
  for a in select unnest(array['patient_identity','appointments','intake_forms','assessments','anamnesis','treatment_plans','procedures','evolutions','adverse_events','photos','documents','consents','reports','exports','patient_portal','settings','users','audit']) as area loop
    v := case
      when new.role in ('profissional','medico','enfermeiro','fisioterapeuta','nutricionista','psicologo') then a.area in ('patient_identity','appointments','intake_forms','assessments','anamnesis','treatment_plans','procedures','evolutions','adverse_events','photos','documents','consents','reports','patient_portal')
      when new.role in ('gestor_clinica','recepcao','secretaria','coordenador_operacional') then a.area in ('patient_identity','appointments','intake_forms','reports','patient_portal')
      when new.role = 'leitura' then a.area in ('patient_identity','appointments','intake_forms','reports')
      when new.role in ('auditor') then a.area in ('patient_identity','appointments','intake_forms','reports','audit')
      else false
    end;
    c := (new.role in ('profissional','medico','enfermeiro','fisioterapeuta','nutricionista','psicologo') and a.area in ('patient_identity','appointments','intake_forms','assessments','anamnesis','treatment_plans','procedures','evolutions','adverse_events','photos','documents','consents','patient_portal'))
      or (new.role in ('gestor_clinica','recepcao','secretaria','coordenador_operacional') and a.area in ('patient_identity','appointments','intake_forms','patient_portal'));
    e := c;
    f := new.role in ('profissional','medico','enfermeiro','fisioterapeuta','nutricionista','psicologo') and a.area in ('assessments','anamnesis','treatment_plans','procedures','evolutions','adverse_events','consents');
    x := new.role in ('profissional','medico','enfermeiro','fisioterapeuta','nutricionista','psicologo') and a.area in ('reports','exports');
    s := v and a.area in ('photos','documents','consents','patient_portal');
    insert into public.staff_permissions(organization_id,user_id,area,can_view,can_create,can_edit,can_finalize,can_export,can_share,updated_by)
      values(new.organization_id,new.user_id,a.area,v,c,e,f,x,s,new.user_id)
    on conflict (organization_id,user_id,area) do nothing;
    if tg_op = 'UPDATE' then
      update public.staff_permissions
      set can_view=v, updated_by=new.user_id, updated_at=now()
      where organization_id=new.organization_id and user_id=new.user_id and area=a.area;
    end if;
  end loop;
  return new;
end;
$$;
drop trigger if exists seed_staff_permissions on public.memberships;
create trigger seed_staff_permissions after insert or update of role on public.memberships
for each row execute function private.seed_staff_permissions();

commit;
