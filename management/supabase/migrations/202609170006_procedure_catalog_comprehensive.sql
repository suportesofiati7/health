begin;

-- Expand the existing procedure catalogue without replacing or invalidating its
-- clinical-workflow columns. Text fields remain easy to search and the JSON
-- sections preserve room for clinic-specific configuration.
alter table public.procedures
  add column if not exists description text not null default '',
  add column if not exists purpose text not null default '',
  add column if not exists indications text not null default '',
  add column if not exists areas text not null default '',
  add column if not exists interval_days integer,
  add column if not exists sessions text not null default '',
  add column if not exists follow_up text not null default '',
  add column if not exists price_cents integer check(price_cents is null or price_cents >= 0),
  add column if not exists commercial_config jsonb not null default '{}' check(jsonb_typeof(commercial_config)='object'),
  add column if not exists benefits text not null default '',
  add column if not exists before_after_care text not null default '',
  add column if not exists recovery text not null default '',
  add column if not exists expected_results text not null default '',
  add column if not exists clinical_details jsonb not null default '{}' check(jsonb_typeof(clinical_details)='object'),
  add column if not exists protocol_instructions text not null default '',
  add column if not exists materials jsonb not null default '{}' check(jsonb_typeof(materials)='object'),
  add column if not exists documents jsonb not null default '{}' check(jsonb_typeof(documents)='object'),
  add column if not exists availability jsonb not null default '{}' check(jsonb_typeof(availability)='object'),
  add column if not exists ai_generated boolean not null default false,
  add column if not exists catalog_version integer not null default 1;

alter table public.financial_records
  add column if not exists procedure_id uuid,
  add column if not exists procedure_snapshot jsonb not null default '{}' check(jsonb_typeof(procedure_snapshot)='object');
alter table public.financial_records
  add constraint financial_records_procedure_fk foreign key (organization_id, procedure_id)
  references public.procedures(organization_id, id) not valid;

create table if not exists public.procedure_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  procedure_id uuid not null,
  version integer not null,
  snapshot jsonb not null check(jsonb_typeof(snapshot)='object'),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  unique(organization_id, procedure_id, version),
  foreign key(organization_id, procedure_id) references public.procedures(organization_id, id)
);
alter table public.procedure_versions enable row level security;
revoke all on public.procedure_versions from anon, authenticated;
grant select, insert on public.procedure_versions to authenticated;
create policy procedure_versions_read on public.procedure_versions for select to authenticated
  using(private.has_role(organization_id,array['proprietario','profissional','leitura']));
create policy procedure_versions_write on public.procedure_versions for insert to authenticated
  with check(private.has_role(organization_id,array['proprietario']) and created_by=auth.uid());

-- Populate the new catalogue fields for the procedures already shipped with
-- the app. These are editable clinical drafts, not patient-specific orders.
update public.procedures p
set description = case
  when p.name ilike '%Harmony%manchas%' then 'Tecnologia de luz/laser para auxiliar no cuidado de alterações de pigmentação após avaliação da pele.'
  when p.name ilike '%Harmony%melasma%' then 'Protocolo adjuvante para melasma, sempre com fotoproteção e planejamento individual.'
  when p.name ilike '%LightSheer%' then 'Redução progressiva de pelos e possível melhora da foliculite conforme ciclo piloso e resposta individual.'
  when p.name ilike '%CO₂%' or p.name ilike '%AcuPulse%' then 'Laser fracionado ablativo para remodelação cutânea e melhora de textura, com recuperação planejada.'
  when p.name ilike '%Toxina%' then 'Aplicação de toxina botulínica para reduzir temporariamente a atividade muscular em áreas selecionadas.'
  when p.name ilike '%Peeling%' then 'Renovação química ou física da superfície cutânea, escolhida conforme avaliação e tolerância da pele.'
  when p.name ilike '%Limpeza%' then 'Higienização e extração quando indicada, respeitando a barreira cutânea e a sensibilidade individual.'
  else 'Procedimento estético planejado de forma individual após avaliação profissional.' end,
 purpose = case
  when p.name ilike '%melasma%' or p.name ilike '%manchas%' then 'Apoiar o controle da aparência irregular do tom e a uniformidade visual da pele.'
  when p.name ilike '%pelos%' then 'Reduzir progressivamente pelos e desconfortos associados à foliculite.'
  when p.name ilike '%Toxina%' then 'Suavizar linhas dinâmicas preservando expressão e proporção individual.'
  when p.name ilike '%Capilar%' then 'Apoiar a abordagem de queixas capilares após investigação e indicação.'
  else 'Apoiar a queixa estética definida na avaliação, sem promessa de resultado.' end,
 indications = case
  when p.name ilike '%CO₂%' or p.name ilike '%AcuPulse%' then 'Textura irregular, cicatrizes selecionadas e sinais de fotoenvelhecimento; indicação depende da avaliação.'
  when p.name ilike '%Toxina%' then 'Linhas dinâmicas e hiperatividade muscular em áreas avaliadas.'
  when p.name ilike '%Capilar%' then 'Queixa de afinamento ou queda após avaliação do couro cabeludo e histórico.'
  when p.name ilike '%PEIM%' then 'Microvasos selecionados após avaliação vascular e exclusão de situações de risco.'
  else 'Queixa compatível com a categoria do procedimento, confirmada em consulta.' end,
 areas = coalesce(nullif(p.treatment_areas,''), case when p.name ilike '%pescoço%' then 'Pescoço e mandíbula' when p.name ilike '%Capilar%' then 'Couro cabeludo' else 'Definida na avaliação' end),
 interval_days = p.followup_days,
 sessions = 'Número individualizado conforme resposta, objetivo e recuperação.',
 follow_up = case when p.followup_days is null then 'Definido após avaliação.' else 'Reavaliar aproximadamente '||p.followup_days||' dias após, ou conforme evolução.' end,
 benefits = 'Possível melhora da queixa-alvo e da qualidade visual da pele, dentro dos limites do método e da resposta individual.',
 before_after_care = 'Antes: informar medicamentos, doenças, gestação/amamentação, alergias, infecções, herpes, uso de ácidos e exposição solar. Depois: seguir a orientação entregue, não manipular a área e usar fotoproteção quando indicada.',
 recovery = case when p.name ilike '%CO₂%' or p.name ilike '%Peeling%' then 'Pode haver vermelhidão, ardor, descamação e sensibilidade por período variável; a recuperação deve ser confirmada no atendimento.' else 'Pode haver vermelhidão, sensibilidade, edema ou desconforto transitórios; a duração varia.' end,
 expected_results = 'Resultados variam com indicação, técnica, área, número de sessões, cuidados e biologia individual. Não há garantia de resultado.',
 clinical_details = jsonb_build_object('contraindications','Infecção ou lesão ativa, alergia conhecida aos componentes, condição clínica descompensada, gestação/amamentação ou outra situação incompatível devem ser avaliadas antes de prosseguir.','risks','Irritação, dor, edema, hematoma, alteração de pigmentação, infecção, queimadura, cicatriz ou resultado irregular, conforme o procedimento.','precautions','Confirmar anamnese, fototipo, exposição solar, medicamentos, procedimentos recentes e consentimento específico.'),
 protocol_instructions = 'Executar somente por profissional habilitado, conforme avaliação, protocolo aprovado, parâmetros do equipamento e registro do atendimento. Não substituir treinamento, bula, norma técnica ou julgamento clínico.',
 materials = jsonb_build_object('products','Definidos pelo protocolo vigente e registrados por lote quando aplicável.','equipment','Selecionar o equipamento cadastrado correspondente.','consumables','EPIs, assepsia, descartáveis e materiais compatíveis com o procedimento.'),
 documents = jsonb_build_object('consent','Consentimento específico antes do atendimento quando aplicável.','photos','Registro técnico antes/depois somente com autorização.','signatures','Assinatura e versão do termo devem ser preservadas.'),
 availability = jsonb_build_object('status',case when p.active then 'ativo' else 'inativo' end,'professionals','Definidos pelo proprietário conforme habilitação.','booking_visible',p.active,'public_visible',false),
 ai_generated = true,
 catalog_version = greatest(coalesce(p.catalog_version,1),2)
where p.description = '' or p.purpose = '';

-- Link existing financial text to the catalogue when names match exactly;
-- unmatched historic/custom entries remain free text.
update public.financial_records f
set procedure_id = p.id,
    procedure_snapshot = to_jsonb(p)
from public.procedures p
where f.organization_id = p.organization_id and lower(trim(f.procedure_name)) = lower(trim(p.name)) and f.procedure_id is null;

commit;
