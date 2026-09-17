begin;

-- Keep the catalog labels broad enough for the clinic's real service mix.
-- Existing records are preserved; this only normalizes older spellings.
update public.procedures
set category = 'injetavel'
where category in ('injetável', 'injetaveis');

update public.procedures
set category = 'microinfusao'
where category in ('microinfusão', 'microagulhamento');

update public.procedures
set ai_generated = false;

-- Two visible test services make it possible to verify that prices entered in
-- the catalog are saved, displayed, and offered to the finance form.
insert into public.procedures(
  organization_id, name, category, default_duration, price_cents,
  description, purpose, indications, areas, sessions, follow_up,
  benefits, before_after_care, recovery, expected_results,
  clinical_details, protocol_instructions, materials, documents,
  availability, review_status, active, ai_generated
)
select
  'a783bd4c-f253-4a94-9365-75c6f1000001', v.name, v.category, v.duration, v.price,
  v.description, v.purpose, v.indications, v.areas, 'Uma sessão; reavaliar antes de indicar continuidade.',
  'Combinar o retorno conforme a resposta e a orientação dada no atendimento.',
  'Pode ajudar na queixa escolhida, dentro dos limites do método e da resposta de cada pessoa.',
  'Antes do atendimento, informar medicamentos, alergias, gestação/amamentação, infecções e procedimentos recentes. Depois, seguir a orientação escrita.',
  'Pode haver sensibilidade, vermelhidão ou desconforto por tempo variável.',
  'O resultado varia de pessoa para pessoa e não é garantido.',
  jsonb_build_object('contraindications','Não realizar sem avaliação quando houver infecção ou lesão ativa, alergia relevante ou condição clínica descompensada.','risks','Dor, irritação, inchaço, alteração de pigmentação, infecção ou resultado irregular podem ocorrer.','precautions','Confirmar anamnese, indicação, consentimento e cuidados antes de começar.'),
  'Realizar somente por profissional habilitado, seguindo o protocolo aprovado e registrando o que foi feito.',
  jsonb_build_object('products','Definir no atendimento e registrar produto e lote quando aplicável.','equipment','Usar equipamento adequado e em condições de uso.','consumables','Usar EPIs e descartáveis compatíveis.'),
  jsonb_build_object('consent','Registrar consentimento quando aplicável.','photos','Fotos somente com autorização.'),
  jsonb_build_object('professionals','Somente profissionais habilitados e autorizados.','booking_visible',true),
  'aprovacao_pendente', true, false
from (values
  ('TESTE — Limpeza facial de conferência', 'higiene', 60, 9900, 'Limpeza facial criada para conferir o cadastro de preço e o fluxo de cobrança.', 'Testar o cadastro, a exibição e a seleção do preço no financeiro.', 'Serviço de teste; substituir pelo procedimento real antes de usar com pacientes.', 'Face'),
  ('TESTE — Avaliação inicial de conferência', 'avaliacao', 45, 4900, 'Avaliação criada para conferir o cadastro de preço e a seleção no financeiro.', 'Testar o fluxo de cadastro e cobrança antes de publicar os serviços reais.', 'Serviço de teste; substituir pelo procedimento real antes de usar com pacientes.', 'A definir')
) as v(name, category, duration, price, description, purpose, indications, areas)
where not exists (
  select 1 from public.procedures p
  where p.organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'
    and p.name = v.name
);

commit;
