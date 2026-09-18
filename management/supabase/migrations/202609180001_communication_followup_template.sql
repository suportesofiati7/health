-- Shared operational template requested by reception: prepare the patient
-- before the appointment without collecting clinical data in WhatsApp.
insert into public.communication_templates
  (organization_id, name, category, channel, variant, subject, body, sender_mode, sensitive)
select
  'a783bd4c-f253-4a94-9365-75c6f1000001'::uuid,
  'Antes da consulta · formulário prévio',
  'agendamento',
  'whatsapp',
  'standard',
  '',
  'Olá, {primeiro_nome}! 🌿\n\nSe você tiver um tempinho antes da consulta, pode preencher nosso formulário prévio por aqui:\n{link_formulario}\n\nEle ajuda a equipe a organizar seu atendimento. Se preferir, podemos preencher tudo com você na recepção.\n\nAté breve!\n{assinatura_remetente}',
  'reception',
  false
where not exists (
  select 1 from public.communication_templates
  where organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'::uuid
    and name = 'Antes da consulta · formulário prévio'
);

