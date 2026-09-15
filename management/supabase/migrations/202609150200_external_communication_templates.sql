begin;

-- External communication model library. The existing communication_templates
-- table is extended in place so current templates and history remain valid.
alter table public.communication_templates
  add column if not exists description text not null default '',
  add column if not exists usage text[] not null default array['whatsapp']::text[],
  add column if not exists availability text not null default 'team',
  add column if not exists keywords text[] not null default '{}'::text[],
  add column if not exists placeholders text[] not null default '{}'::text[],
  add column if not exists favorite boolean not null default false,
  add column if not exists deleted_at timestamptz;

alter table public.communication_templates drop constraint if exists communication_templates_availability_check;
alter table public.communication_templates add constraint communication_templates_availability_check
  check (availability in ('private','team'));
alter table public.communication_templates drop constraint if exists communication_templates_usage_check;
alter table public.communication_templates add constraint communication_templates_usage_check
  check (usage <@ array['whatsapp','email']::text[] and cardinality(usage) > 0);
alter table public.communication_templates drop constraint if exists communication_templates_variant_check;
alter table public.communication_templates add constraint communication_templates_variant_check
  check (variant in ('short','standard','warm','formal'));

create table if not exists public.communication_template_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  template_id uuid not null references public.communication_templates(id) on delete cascade,
  version integer not null,
  name text not null,
  category text not null,
  subject text not null default '',
  body text not null,
  placeholders text[] not null default '{}'::text[],
  changed_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(template_id, version)
);

create table if not exists public.communication_custom_fields (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  key text not null,
  label text not null,
  group_name text not null default 'Personalizado',
  active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(organization_id, key)
);

create index if not exists communication_templates_search
  on public.communication_templates(organization_id, active, deleted_at, category, favorite, updated_at desc);

alter table public.communication_template_versions enable row level security;
alter table public.communication_custom_fields enable row level security;
revoke all on public.communication_template_versions, public.communication_custom_fields from anon, authenticated;
grant select, insert on public.communication_template_versions, public.communication_custom_fields to authenticated;

drop policy if exists communication_template_versions_read on public.communication_template_versions;
create policy communication_template_versions_read on public.communication_template_versions
  for select to authenticated using (private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura']));
drop policy if exists communication_template_versions_insert on public.communication_template_versions;
create policy communication_template_versions_insert on public.communication_template_versions
  for insert to authenticated with check (private.has_role(organization_id,array['proprietario','profissional','recepcao']) and changed_by=auth.uid());
drop policy if exists communication_custom_fields_read on public.communication_custom_fields;
create policy communication_custom_fields_read on public.communication_custom_fields
  for select to authenticated using (private.has_role(organization_id,array['proprietario','profissional','recepcao','leitura']));
drop policy if exists communication_custom_fields_insert on public.communication_custom_fields;
create policy communication_custom_fields_insert on public.communication_custom_fields
  for insert to authenticated with check (private.has_role(organization_id,array['proprietario','profissional','recepcao']) and created_by=auth.uid());

create or replace function private.communication_placeholders(input text)
returns text[] language sql immutable set search_path = '' as $$
  select coalesce(array_agg(distinct match[1] order by match[1]), '{}'::text[])
  from regexp_matches(coalesce(input,''), '\\{\\{([a-zA-Z0-9_]+)\\}\\}', 'g') as match;
$$;

create or replace function private.sync_communication_template_placeholders()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.placeholders := private.communication_placeholders(coalesce(new.subject,'') || E'\\n' || coalesce(new.body,''));
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists communication_template_placeholders on public.communication_templates;
create trigger communication_template_placeholders before insert or update of subject,body on public.communication_templates
for each row execute function private.sync_communication_template_placeholders();

create or replace function private.snapshot_communication_template()
returns trigger language plpgsql security definer set search_path = '' as $$
declare next_version integer;
begin
  if tg_op = 'UPDATE' and (
    old.name is distinct from new.name or old.category is distinct from new.category or
    old.subject is distinct from new.subject or old.body is distinct from new.body
  ) then
    select coalesce(max(version),0)+1 into next_version from public.communication_template_versions where template_id=new.id;
    insert into public.communication_template_versions(organization_id,template_id,version,name,category,subject,body,placeholders,changed_by)
    values(new.organization_id,new.id,next_version,new.name,new.category,new.subject,new.body,new.placeholders,auth.uid());
  end if;
  return new;
end;
$$;
drop trigger if exists communication_template_version_snapshot on public.communication_templates;
create trigger communication_template_version_snapshot after update on public.communication_templates
for each row execute function private.snapshot_communication_template();

-- The model is intentionally explicit: empty values are surfaced to the UI as
-- missing fields and may never be silently sent to a patient.
create or replace function public.communication_missing_placeholders(template_body text, field_values jsonb)
returns text[] language sql immutable set search_path = '' as $$
  select coalesce(array_agg(distinct match[1] order by match[1]), '{}'::text[])
  from regexp_matches(coalesce(template_body,''), '\\{\\{([a-zA-Z0-9_]+)\\}\\}', 'g') as match
  where nullif(trim(coalesce(field_values ->> match[1],'')),'') is null;
$$;
revoke all on function public.communication_missing_placeholders(text,jsonb) from public, anon;
grant execute on function public.communication_missing_placeholders(text,jsonb) to authenticated;

create or replace function public.communication_render_template(template_body text, field_values jsonb)
returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object(
    'text', regexp_replace(coalesce(template_body,''), '\\{\\{([a-zA-Z0-9_]+)\\}\\}',
      '\\1', 'g'),
    'missing', public.communication_missing_placeholders(template_body, field_values)
  );
$$;
revoke all on function public.communication_render_template(text,jsonb) from public, anon;
grant execute on function public.communication_render_template(text,jsonb) to authenticated;

-- Base library requested for external WhatsApp communication. Additional
-- variants can be created from the management UI without a schema change.
do $$
declare org uuid := 'a783bd4c-f253-4a94-9365-75c6f1000001';
begin
  insert into public.communication_templates
    (organization_id,name,category,channel,variant,subject,body,sender_mode,sensitive,description,usage,availability,keywords)
  select org, x.name, x.category, 'whatsapp', x.variant, '', x.body, 'franciele', false, x.description,
    array['whatsapp']::text[], 'team', x.keywords
  from (values
    ('Primeiro contato — padrão','Primeiro contato','standard','Olá, {{nome}}. Tudo bem?\n\nMeu nome é Franciele Sofiatis.\n\nEstou entrando em contato a respeito de {{assunto}}.\n\n{{observacao}}\n\nFico à disposição.','Contato inicial',array['primeiro contato']),
    ('Primeiro contato — recebido pelo WhatsApp','Primeiro contato','standard','Olá, {{nome}}. Tudo bem?\n\nObrigada pelo seu contato.\n\nRecebi sua mensagem sobre {{assunto}} e vou dar continuidade ao seu atendimento por aqui.\n\nPara que eu possa compreender melhor a situação, poderia me informar, por gentileza:\n\n{{perguntas_iniciais}}','Resposta a mensagem recebida',array['whatsapp','entrada']),
    ('Primeiro contato — indicação','Primeiro contato','standard','Olá, {{nome}}. Tudo bem?\n\nMeu nome é Franciele Sofiatis. Recebi seu contato por indicação de {{indicador}}.\n\nEntendi que você gostaria de orientação a respeito de {{assunto}}.\n\nQuando puder, me envie um breve resumo da situação para que possamos verificar a melhor forma de prosseguir.','Contato por indicação',array['indicação']),
    ('Solicitação geral de informações','Cadastro','standard','Olá, {{nome}}.\n\nPara darmos continuidade, preciso confirmar algumas informações:\n\n{{lista_informacoes}}\n\nAssim que possível, pode me encaminhar por aqui.\n\nObrigada.','Dados cadastrais',array['cadastro','informações']),
    ('Informações faltantes','Cadastro','standard','Olá, {{nome}}.\n\nAo revisar as informações disponíveis, identifiquei que ainda precisamos dos seguintes dados:\n\n{{lista_informacoes}}\n\nQuando puder, por favor, me encaminhe para que possamos prosseguir.','Pendências de cadastro',array['pendência']),
    ('Confirmação de dados cadastrais','Cadastro','formal','Olá, {{nome}}.\n\nPara mantermos seu cadastro atualizado, poderia confirmar, por gentileza:\n\nNome completo: {{nome_completo}}\nTelefone: {{telefone}}\nE-mail: {{email}}\n\nCaso alguma informação esteja incorreta, por favor, me informe a alteração.','Confirmação de cadastro',array['dados']),
    ('Solicitação inicial de documentos','Documentos','standard','Olá, {{nome}}.\n\nPara prosseguirmos com {{tipo_servico}}, precisamos dos seguintes documentos:\n\n{{lista_documentos}}\n\nVocê pode encaminhá-los por aqui ou por {{meio_envio}}.\n\nCaso tenha dúvida sobre algum documento, me avise.','Lista inicial de documentos',array['documento','lista']),
    ('Documento específico','Documentos','standard','Olá, {{nome}}.\n\nPrecisamos que você nos encaminhe o seguinte documento:\n\n{{documento}}\n\n{{orientacao_documento}}\n\nAssim que estiver disponível, pode enviá-lo por aqui.','Solicitação de documento',array['documento']),
    ('Documentos pendentes','Documentos','standard','Olá, {{nome}}.\n\nRevisei a documentação recebida e ainda estão pendentes:\n\n{{lista_documentos}}\n\nAssim que possível, por favor, encaminhe esses itens para que possamos continuar.','Pendências documentais',array['pendência']),
    ('Documento recebido','Documentos','short','Olá, {{nome}}.\n\nRecebi {{documento}}.\n\nObrigada pelo envio.\n\nVamos anexá-lo ao seu atendimento/processo e, caso seja necessário algum complemento, entraremos em contato.','Confirmação de documento',array['recebimento']),
    ('Documentação completa','Documentos','standard','Olá, {{nome}}.\n\nConfirmo que recebemos a documentação solicitada até o momento.\n\nAgora seguiremos para a próxima etapa de {{tipo_servico}}.\n\nCaso surja necessidade de algum documento adicional durante a análise, entraremos em contato.','Documentação completa',array['completo']),
    ('Proposta enviada','Propostas','standard','Olá, {{nome}}.\n\nConforme conversamos, segue a proposta referente a {{tipo_servico}}:\n\n{{resumo_proposta}}\n\nValor: {{valor}}\n\n{{condicoes}}\n\nSe tiver alguma dúvida, posso esclarecer por aqui.','Envio de proposta',array['proposta','orçamento']),
    ('Follow-up da proposta','Propostas','standard','Olá, {{nome}}.\n\nEstou entrando em contato para saber se conseguiu analisar a proposta referente a {{tipo_servico}}.\n\nSe houver alguma dúvida ou se precisar de algum esclarecimento antes de decidir, pode me escrever por aqui.','Acompanhamento de proposta',array['follow-up']),
    ('Proposta aceita','Propostas','standard','Olá, {{nome}}.\n\nObrigada pela confirmação.\n\nRegistramos seu aceite da proposta referente a {{tipo_servico}}.\n\nAgora seguiremos com:\n\n{{proximos_passos}}','Aceite de proposta',array['aceite']),
    ('Proposta de horário','Agendamento','standard','Olá, {{nome}}.\n\nTemos disponibilidade para {{tipo_atendimento}} em:\n\nData: {{data}}\nHorário: {{hora}}\n\nEsse horário funciona para você?','Oferta de horário',array['agenda','horário']),
    ('Opções de horário','Agendamento','standard','Olá, {{nome}}.\n\nPara {{tipo_atendimento}}, temos as seguintes opções:\n\n{{opcoes_horarios}}\n\nPor favor, me informe qual delas é mais conveniente.','Opções de agenda',array['agenda']),
    ('Agendamento confirmado','Agendamento','standard','Olá, {{nome}}.\n\nSeu atendimento está confirmado:\n\nData: {{data}}\nHorário: {{hora}}\nModalidade: {{modalidade}}\nLocal/Link: {{local_ou_link}}\n\nCaso precise alterar o horário, pedimos que nos avise com antecedência.','Confirmação de atendimento',array['confirmação']),
    ('Agendamento on-line','Agendamento','standard','Olá, {{nome}}.\n\nSeu atendimento on-line está confirmado:\n\nData: {{data}}\nHorário: {{hora}}\n\nLink de acesso:\n{{link_reuniao}}\n\nRecomendamos acessar alguns minutos antes para verificar áudio e conexão.','Confirmação online',array['online','reunião']),
    ('Lembrete no dia anterior','Lembretes','standard','Olá, {{nome}}.\n\nPassando para lembrar do seu atendimento amanhã:\n\n{{data}} às {{hora}}\n\n{{informacoes_atendimento}}\n\nAté amanhã.','Lembrete D-1',array['lembrete']),
    ('Lembrete no mesmo dia','Lembretes','short','Olá, {{nome}}.\n\nLembrando que seu atendimento está marcado para hoje, às {{hora}}.\n\n{{informacoes_atendimento}}\n\nAté mais tarde.','Lembrete do dia',array['lembrete']),
    ('Reagendamento confirmado','Reagendamento','standard','Olá, {{nome}}.\n\nO reagendamento foi realizado com sucesso.\n\nNovo horário:\n\nData: {{data}}\nHorário: {{hora}}\n\n{{informacoes_atendimento}}','Reagendamento',array['agenda']),
    ('Cancelamento solicitado pelo cliente','Cancelamento','standard','Olá, {{nome}}.\n\nConfirmo o cancelamento do atendimento previsto para {{data_hora}}.\n\nCaso queira remarcar posteriormente, pode entrar em contato por aqui.','Cancelamento',array['cancelamento']),
    ('Pagamento recebido','Pagamento','short','Olá, {{nome}}.\n\nConfirmamos o recebimento do pagamento no valor de {{valor}}, referente a {{tipo_servico}}.\n\nObrigada.','Confirmação financeira',array['pagamento']),
    ('Dados para pagamento','Pagamento','standard','Olá, {{nome}}.\n\nSeguem os dados para pagamento de {{tipo_servico}}:\n\nValor: {{valor}}\nForma: {{forma_pagamento}}\nVencimento: {{vencimento}}\n\n{{dados_pagamento}}\n\nApós o pagamento, por favor, encaminhe o comprovante por aqui.','Instruções de pagamento',array['pagamento']),
    ('Lembrete de vencimento','Pagamento','standard','Olá, {{nome}}.\n\nPassando para lembrar que o pagamento referente a {{tipo_servico}} tem vencimento em {{vencimento}}.\n\nValor: {{valor}}\n\n{{informacoes_pagamento}}\n\nCaso já tenha realizado o pagamento, por favor, desconsidere esta mensagem.','Vencimento',array['cobrança']),
    ('Atualização geral','Andamento','standard','Olá, {{nome}}.\n\nPassando para atualizar você sobre {{tipo_servico}}.\n\nNo momento, o status é:\n\n{{status}}\n\n{{observacao}}\n\nAssim que houver uma nova movimentação relevante, entraremos em contato.','Atualização de andamento',array['status','andamento']),
    ('Sem novidade relevante','Andamento','short','Olá, {{nome}}.\n\nAté o momento, não houve nova movimentação relevante em {{tipo_servico}} desde nossa última atualização.\n\nContinuamos acompanhando e avisaremos assim que houver qualquer alteração importante.','Sem novidades',array['andamento']),
    ('Protocolo realizado','Andamento','standard','Olá, {{nome}}.\n\nConfirmo que {{procedimento}} foi protocolado.\n\nProtocolo: {{protocolo}}\nData: {{data}}\n\n{{observacao}}\n\nAgora acompanharemos as próximas movimentações.','Protocolo',array['protocolo']),
    ('Aviso de prazo','Prazos','standard','Olá, {{nome}}.\n\nTemos um prazo relacionado a {{assunto}} com vencimento em {{prazo}}.\n\nPara conseguirmos cumprir esse prazo, precisamos receber de você:\n\n{{pendencias}}\n\nPreferencialmente até {{data_limite_interna}}.','Aviso de prazo',array['prazo']),
    ('Primeiro follow-up','Follow-up','standard','Olá, {{nome}}.\n\nEstou retomando nossa conversa sobre {{assunto}}.\n\nVocê conseguiu verificar minha última mensagem?\n\nFico no aguardo para podermos prosseguir.','Primeiro retorno',array['follow-up']),
    ('Segundo follow-up','Follow-up','standard','Olá, {{nome}}.\n\nEstou entrando em contato novamente sobre {{assunto}}.\n\nAinda precisamos do seu retorno para conseguirmos avançar.\n\nQuando puder, por favor, me responda por aqui.','Segundo retorno',array['follow-up']),
    ('Atendimento pausado','Andamento','standard','Olá, {{nome}}.\n\nComo estamos aguardando {{pendencia}}, o atendimento ficará temporariamente aguardando seu retorno.\n\nAssim que recebermos o necessário, poderemos retomar a próxima etapa.','Atendimento aguardando',array['pausa']),
    ('Retomada de atendimento','Andamento','standard','Olá, {{nome}}.\n\nRecebemos {{informacao_ou_documento}} e podemos retomar seu atendimento.\n\nO próximo passo será:\n\n{{proximo_passo}}','Retomada',array['retomada']),
    ('Fora do horário de atendimento','Indisponibilidade','standard','Olá.\n\nObrigada pela mensagem.\n\nNosso horário de atendimento é {{horario_funcionamento}}.\n\nSua mensagem foi recebida e será respondida assim que retomarmos o atendimento.\n\nFranciele Sofiatis','Fora do expediente',array['ausência']),
    ('Recebimento','Respostas rápidas','short','Olá, {{nome}}.\n\nRecebi sua mensagem. Obrigada.\n\nVou verificar e retorno assim que possível.','Resposta rápida',array['rápida']),
    ('Documento recebido — curto','Respostas rápidas','short','Perfeito, {{nome}}.\n\nDocumento recebido.\n\nObrigada pelo envio.','Resposta rápida',array['documento']),
    ('Pedido de confirmação','Confirmação','short','Olá, {{nome}}.\n\nPor favor, confirme o recebimento desta mensagem quando puder.\n\nObrigada.','Confirmação de recebimento',array['confirmação']),
    ('Orientação importante','Respostas rápidas','standard','Olá, {{nome}}.\n\nGostaria de reforçar uma orientação importante relacionada a {{assunto}}:\n\n{{orientacao}}\n\nCaso tenha alguma dúvida antes de tomar qualquer providência, entre em contato conosco.','Orientação',array['orientação']),
    ('Conclusão do serviço','Encerramento','formal','Olá, {{nome}}.\n\nInformamos que {{tipo_servico}} foi concluído.\n\nResultado:\n{{resultado}}\n\n{{orientacoes_finais}}\n\nFoi um prazer atender você.\n\nAtenciosamente,\nFranciele Sofiatis','Conclusão',array['encerramento']),
    ('Pesquisa de satisfação','Avaliação','standard','Olá, {{nome}}.\n\nSeu atendimento foi concluído e gostaríamos de saber como foi sua experiência.\n\nSe puder, deixe sua avaliação aqui:\n\n{{link_avaliacao}}\n\nSeu retorno é importante para aprimorarmos nosso atendimento.\n\nObrigada.\n\nFranciele Sofiatis','Pesquisa',array['avaliação']),
    ('Mensagem personalizada com campos livres','Personalizados','formal','Olá, {{nome}}.\n\n{{texto_livre}}\n\nAtenciosamente,\nFranciele Sofiatis','Modelo livre',array['personalizado']),
    ('Modelo universal','Personalizados','formal','Olá, {{nome}}.\n\n{{mensagem_principal}}\n\n{{informacao_complementar}}\n\n{{acao_solicitada}}\n\n{{prazo_ou_proximo_passo}}\n\nAtenciosamente,\nFranciele Sofiatis','Modelo-base para nova comunicação',array['universal','base'])
  ) as x(name,category,variant,body,description,keywords)
  on conflict (organization_id,name,variant,channel) do update set body=excluded.body, description=excluded.description, keywords=excluded.keywords, usage=excluded.usage, deleted_at=null, active=true;
end $$;

commit;
