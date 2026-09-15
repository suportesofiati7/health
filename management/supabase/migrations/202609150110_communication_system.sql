begin;

-- Communication is a contextual layer over the existing patient, appointment and
-- task records. The old communications rows (encrypted backups) remain valid.
alter table public.communications add column if not exists channel text not null default 'email';
alter table public.communications add column if not exists direction text not null default 'outbound';
alter table public.communications add column if not exists visibility text not null default 'external';
alter table public.communications add column if not exists category text not null default 'administrativo';
alter table public.communications add column if not exists subject text not null default '';
alter table public.communications add column if not exists body text not null default '';
alter table public.communications add column if not exists rendered_signature text not null default '';
alter table public.communications add column if not exists recipient_name text not null default '';
alter table public.communications add column if not exists recipient_address text not null default '';
alter table public.communications add column if not exists appointment_id uuid;
alter table public.communications add column if not exists template_id uuid;
alter table public.communications add column if not exists sent_at timestamptz;
alter table public.communications add column if not exists follow_up_at timestamptz;
alter table public.communications add column if not exists metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object');
alter table public.communications drop constraint if exists communications_recipient_check;
alter table public.communications add constraint communications_channel_valid check(channel in ('whatsapp','email','telefone','interno'));
alter table public.communications add constraint communications_direction_valid check(direction in ('inbound','outbound'));
alter table public.communications add constraint communications_visibility_valid check(visibility in ('external','internal'));
alter table public.communications add constraint communications_status_valid check(status in ('pendente','aceito','falha','nao_confirmado','rascunho','enviado','recebido','sem_resposta','resolvido'));
alter table public.communications add constraint communications_appointment_fk foreign key(organization_id,appointment_id) references public.appointments(organization_id,id);

create table if not exists public.communication_preferences (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null,
  patient_id uuid not null, preferred_channel text not null default 'whatsapp' check(preferred_channel in ('whatsapp','email','telefone')),
  preferred_time text not null default '', operational_allowed boolean not null default true,
  relationship_allowed boolean not null default false, do_not_contact boolean not null default false,
  notes text not null default '', updated_by uuid not null default auth.uid() references auth.users(id), updated_at timestamptz not null default now(),
  unique(organization_id,patient_id), foreign key(organization_id,patient_id) references public.patients(organization_id,id)
);

create table if not exists public.communication_templates (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null,
  name text not null, category text not null, channel text not null default 'whatsapp' check(channel in ('whatsapp','email','telefone','interno')),
  variant text not null default 'standard' check(variant in ('short','standard','warm')),
  subject text not null default '', body text not null, sender_mode text not null default 'reception' check(sender_mode in ('reception','franciele','sender')),
  sensitive boolean not null default false, active boolean not null default true, created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(organization_id,name,variant,channel)
);

create table if not exists public.communication_conversations (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, title text not null default '', kind text not null default 'equipe' check(kind in ('equipe','direta')),
  patient_id uuid, appointment_id uuid, created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id), foreign key(organization_id,appointment_id) references public.appointments(organization_id,id)
);
alter table public.communication_conversations add constraint communication_conversations_org_id_key unique(organization_id,id);
create table if not exists public.communication_messages (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, conversation_id uuid not null, sender_id uuid not null default auth.uid() references auth.users(id),
  body text not null check(length(body)<=20000), created_at timestamptz not null default now(), read_at timestamptz,
  foreign key(organization_id,conversation_id) references public.communication_conversations(organization_id,id)
);

create index if not exists communications_attention on public.communications(organization_id,status,follow_up_at,created_at desc);
create index if not exists communications_patient on public.communications(organization_id,patient_id,created_at desc);
create index if not exists communication_messages_time on public.communication_messages(organization_id,conversation_id,created_at);

do $$ declare t text; begin
  foreach t in array array['communication_preferences','communication_templates','communication_conversations','communication_messages'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon,authenticated',t);
    execute format('grant select,insert,update on public.%I to authenticated',t);
    execute format('create policy communication_staff_read on public.%I for select to authenticated using(private.has_role(organization_id,array[''proprietario'',''profissional'',''recepcao'',''leitura'']))',t);
    execute format('create policy communication_staff_write on public.%I for insert to authenticated with check(private.has_role(organization_id,array[''proprietario'',''profissional'',''recepcao'',''leitura'']))',t);
    execute format('create policy communication_staff_update on public.%I for update to authenticated using(private.has_role(organization_id,array[''proprietario'',''profissional'',''recepcao'',''leitura''])) with check(private.has_role(organization_id,array[''proprietario'',''profissional'',''recepcao'',''leitura'']))',t);
  end loop;
end $$;
create policy communication_history_read on public.communications for select to authenticated using(private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura']));
create policy communication_history_insert on public.communications for insert to authenticated with check(private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura']) and created_by=auth.uid());
create policy communication_history_update on public.communications for update to authenticated using(private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura'])) with check(private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura']));
grant select,insert,update on public.communications to authenticated;

-- Small, high-quality initial library. More variants can be added in the UI.
insert into public.communication_templates(organization_id,name,category,channel,variant,subject,body,sender_mode,sensitive)
values
('a783bd4c-f253-4a94-9365-75c6f1000001','Primeiro contato','lead','whatsapp','standard','', 'Olá, {primeiro_nome}! 🌿\n\nQue bom receber sua mensagem.\n\nSou da recepção da Franciele e estou por aqui para ajudar você com as informações que precisar.\n\nSe quiser, pode me contar um pouco sobre o que está buscando ou qual é a sua principal dúvida. Assim conseguimos orientar você com cuidado.\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Confirmação de consulta','agendamento','whatsapp','standard','', 'Olá, {primeiro_nome}! 🌿\n\nSeu horário com a Franciele está confirmado:\n\n📅 {data_consulta}\n🕒 {hora_consulta}\n\n📍 {endereco}\n\nSe surgir qualquer dúvida antes disso, pode falar conosco por aqui. 🤍\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Lembrete de consulta','lembrete','whatsapp','standard','', 'Olá, {primeiro_nome}! 🌿\n\nPassando para lembrar da sua consulta com a Franciele amanhã:\n\n📅 {data_consulta}\n🕒 {hora_consulta}\n\nQuando puder, poderia confirmar sua presença para nós? 🤍\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Lembrete de consulta · curto','lembrete','whatsapp','short','', 'Olá, {primeiro_nome}! 🌿\n\nLembrando do seu horário amanhã, {data_consulta}, às {hora_consulta}.\n\nSe precisar ajustar, nos avise assim que possível.\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Pós-consulta','pos_consulta','whatsapp','standard','', 'Olá, {primeiro_nome}! 🤍\n\nFoi um prazer receber você hoje. Esperamos que tenha se sentido acolhida e que as informações tenham ficado claras.\n\nSe depois, com mais calma, surgir alguma dúvida, pode falar conosco.\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Pós-procedimento · acompanhamento','pos_procedimento','whatsapp','warm','', 'Olá, {primeiro_nome}! 🌿\n\nPassando para acompanhar você depois do procedimento. Como está se sentindo?\n\nSe houver alguma dúvida ou algo que esteja deixando você insegura, pode nos contar. 🤍\n\n{assinatura_remetente}','reception',true),
('a783bd4c-f253-4a94-9365-75c6f1000001','Retorno devido','retorno','whatsapp','standard','', 'Olá, {primeiro_nome}! 🌿\n\nPassando porque já estamos no período indicado para o seu retorno.\n\nSe desejar, podemos organizar um horário para a Franciele acompanhar sua evolução com calma.\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Pedido de feedback','feedback','whatsapp','standard','', 'Olá, {primeiro_nome}! 🌿\n\nGostaríamos muito de saber como você se sentiu durante seu atendimento com a Franciele. Sua opinião nos ajuda a cuidar cada vez melhor de cada detalhe. 🤍\n\n{link_feedback}\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Documento pendente','documento','whatsapp','standard','', 'Olá, {primeiro_nome}! 🌿\n\nPassando para lembrar que ainda estamos aguardando:\n\n📄 {documento}\n\nAssim que recebermos, conseguimos seguir com a próxima etapa. Se já tiver enviado, por favor desconsidere. 🤍\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Lead · retomada cuidadosa','lead','whatsapp','warm','', 'Olá, {primeiro_nome}! 🌿\n\nPassando apenas para saber se ficou alguma dúvida sobre o atendimento com a Franciele.\n\nNão precisa decidir nada agora. Se quiser retomar a conversa ou precisar de alguma informação, estamos por aqui. 🤍\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Solicitação ao profissional','profissional','email','standard','Informações sobre {primeiro_nome}', 'Olá, {nome_profissional}.\n\nEstamos organizando o atendimento de {primeiro_nome} e gostaríamos de solicitar, se possível:\n\n{informacao_solicitada}\n\nAgradecemos pela colaboração.\n\n{assinatura_remetente}','sender',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Equipe · revisão necessária','interno','interno','standard','', '@Franciele, a paciente {primeiro_nome} entrou em contato sobre:\n\n{assunto}\n\nVinculado a: {contexto}\n\nQuando puder, preciso da sua orientação para responder.','sender',false)
on conflict (organization_id,name,variant,channel) do nothing;

insert into public.communication_templates(organization_id,name,category,channel,variant,subject,body,sender_mode,sensitive) values
('a783bd4c-f253-4a94-9365-75c6f1000001','Confirmação de consulta · curta','agendamento','whatsapp','short','', 'Olá, {primeiro_nome}! 🌿\n\nTudo certo com seu horário em {data_consulta}, às {hora_consulta}.\n\nAté breve. 🤍\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Confirmação de consulta · acolhedora','agendamento','whatsapp','warm','', 'Olá, {primeiro_nome}! 🌿\n\nSeu primeiro encontro com a Franciele ficou marcado para {data_consulta}, às {hora_consulta}.\n\nA consulta é feita com calma para que você possa trazer suas dúvidas e expectativas. Se precisar de alguma informação antes do dia, estamos à disposição. 🤍\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Pós-consulta · acolhedora','pos_consulta','whatsapp','warm','', 'Olá, {primeiro_nome}! 🤍\n\nGostei muito de receber você hoje. Espero que nossa conversa tenha ajudado você a compreender melhor as possibilidades e a se sentir segura em relação às decisões sobre seu cuidado.\n\nSe surgir alguma dúvida, pode falar comigo por aqui.\n\n{assinatura_remetente}','franciele',true),
('a783bd4c-f253-4a94-9365-75c6f1000001','Pós-procedimento · curto','pos_procedimento','whatsapp','short','', 'Olá, {primeiro_nome}! 🤍\n\nComo você está se sentindo depois do procedimento? Estamos por aqui se precisar.\n\n{assinatura_remetente}','reception',true),
('a783bd4c-f253-4a94-9365-75c6f1000001','Retorno · convite tranquilo','retorno','whatsapp','warm','', 'Olá, {primeiro_nome}! 🌿\n\nFaz algum tempo desde o seu último atendimento e lembramos de você. Se quiser revisar seus cuidados ou conversar sobre uma nova necessidade, podemos verificar um horário — sem pressa. 🤍\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Feedback · curto','feedback','whatsapp','short','', 'Olá, {primeiro_nome}! 🌿\n\nComo você se sentiu durante seu atendimento? Se puder, compartilhe sua experiência: {link_feedback}\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Localização','agendamento','whatsapp','standard','', 'Olá, {primeiro_nome}! 🌿\n\nPara chegar ao atendimento:\n\n📍 {endereco}\n🗺️ {link_localizacao}\n\nSe tiver dificuldade para encontrar o local, pode chamar por aqui.\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Cancelamento cuidadoso','agendamento','whatsapp','standard','', 'Tudo bem, {primeiro_nome}. 🌿\n\nObrigada por nos avisar. Quando quiser reagendar, pode falar conosco por aqui e teremos prazer em ajudar.\n\n{assinatura_remetente}','reception',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Ligação · não atendeu','administrativo','telefone','standard','', 'Tentativa de contato com {primeiro_nome}.\n\nResultado: não atendeu.\n\nPróxima ação: tentar novamente em outro horário.','sender',false),
('a783bd4c-f253-4a94-9365-75c6f1000001','Pagamento · confirmação','administrativo','email','standard','Pagamento recebido', 'Olá, {primeiro_nome}! 🌿\n\nRecebemos a confirmação do pagamento referente a {documento}. Está tudo certo por aqui.\n\nObrigada. 🤍\n\n{assinatura_remetente}','reception',false)
on conflict (organization_id,name,variant,channel) do nothing;

commit;
