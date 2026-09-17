export const STANDARD_PLACEHOLDERS = [
  ['nome', 'Primeiro nome do cliente', 'Cliente'], ['nome_completo', 'Nome completo', 'Cliente'],
  ['telefone', 'Telefone', 'Cliente'], ['email', 'E-mail', 'Cliente'], ['cpf', 'CPF', 'Cliente'],
  ['data_nascimento', 'Data de nascimento', 'Cliente'], ['numero_cliente', 'Código do cliente', 'Cliente'],
  ['numero_caso', 'Número interno do caso', 'Atendimento'], ['tipo_servico', 'Serviço/procedimento', 'Processo/serviço'],
  ['responsavel', 'Profissional responsável', 'Profissional'], ['data', 'Data relacionada', 'Agendamento'],
  ['hora', 'Horário', 'Agendamento'], ['data_hora', 'Data e horário', 'Agendamento'], ['local', 'Endereço/local', 'Agendamento'],
  ['link', 'Link relevante', 'Atendimento'], ['link_reuniao', 'Link da reunião', 'Agendamento'], ['valor', 'Valor', 'Financeiro'],
  ['forma_pagamento', 'Forma de pagamento', 'Financeiro'], ['vencimento', 'Data de vencimento', 'Financeiro'],
  ['numero_parcela', 'Número da parcela', 'Financeiro'], ['documento', 'Nome do documento', 'Documentos'],
  ['lista_documentos', 'Documentos necessários', 'Documentos'], ['prazo', 'Prazo', 'Processo/serviço'], ['protocolo', 'Protocolo', 'Processo/serviço'],
  ['status', 'Status atual', 'Processo/serviço'], ['observacao', 'Informação complementar', 'Atendimento'],
  ['nome_empresa', 'Empresa/escritório', 'Sistema'], ['nome_atendente', 'Pessoa que envia', 'Profissional'], ['data_hoje', 'Data atual', 'Sistema'],
];

const firstName = (patient) => (patient?.preferred_name || patient?.full_name || '').trim().split(/\s+/)[0] || '';
const dateValue = (value) => value ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(value)) : '';
const timeValue = (value) => value ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '';

export function valuesForPatient(patient, member, appointment) {
  const first = firstName(patient);
  const appointmentDate = dateValue(appointment?.starts_at);
  const appointmentTime = timeValue(appointment?.starts_at);
  const address = patient?.address && typeof patient.address === 'object'
    ? [patient.address.street, patient.address.number, patient.address.neighborhood, patient.address.city, patient.address.state].filter(Boolean).join(', ')
    : '';
  const service = appointment?.label || 'seu atendimento';
  const generic = 'as informações necessárias para darmos continuidade ao atendimento';
  return {
    nome: first, primeiro_nome: first, nome_completo: patient?.full_name || '', telefone: patient?.phone || '', email: patient?.email || '',
    nome_atendente: member?.name || 'Franciele Sofiati', responsavel: member?.name || 'Franciele Sofiati', nome_profissional: member?.name || 'Franciele Sofiati', nome_empresa: 'Franciele Sofiati', data_hoje: dateValue(new Date()),
    data: appointmentDate || 'a combinar', hora: appointmentTime || 'a combinar', data_hora: appointmentDate && appointmentTime ? `${appointmentDate} às ${appointmentTime}` : 'a combinar',
    data_consulta: appointmentDate || 'a combinar', hora_consulta: appointmentTime || 'a combinar', local: address || 'Londrina, PR', endereco: address || 'Londrina, PR', local_ou_link: address || 'Londrina, PR', link: 'este canal', link_reuniao: 'o link será enviado pela equipe', link_localizacao: 'a localização será enviada pela equipe', link_feedback: 'o link será enviado pela equipe', link_avaliacao: 'o link será enviado pela equipe',
    tipo_servico: service, tipo_atendimento: service, modalidade: 'presencial', assunto: 'seu atendimento', observacao: 'Se precisar de qualquer esclarecimento, estamos à disposição.', contexto: 'seu atendimento',
    lista_informacoes: generic, lista_documentos: 'os documentos solicitados', documento: 'o documento solicitado', informacao_solicitada: 'a informação solicitada', perguntas_iniciais: 'qual é a sua principal dúvida e como podemos ajudar', meio_envio: 'este WhatsApp',
    indicador: 'uma pessoa conhecida', orientacao_documento: 'Se precisar de ajuda, pode nos escrever por aqui.', orientacao: 'Siga as orientações recebidas e, em caso de dúvida, fale conosco.', informacoes_atendimento: 'Se precisar alterar alguma informação, avise-nos com antecedência.', informacoes_pagamento: 'Se já realizou o pagamento, pode nos enviar o comprovante por aqui.',
    resumo_proposta: 'o plano conversado', valor: 'conforme combinado', condicoes: 'As condições seguem a proposta apresentada.', proximos_passos: 'a próxima etapa do atendimento', opcoes_horarios: 'os horários disponíveis apresentados pela equipe', resultado: 'atendimento concluído conforme planejado', orientacoes_finais: 'Siga as orientações combinadas para os próximos dias.',
    pendencias: 'as informações pendentes', pendencia: 'as informações necessárias', proximo_passo: 'a próxima etapa do atendimento', informacao_ou_documento: 'as informações enviadas', prazo: 'o prazo combinado', data_limite_interna: appointmentDate || 'a combinar', protocolo: 'o protocolo do atendimento', procedimento: service, status: 'em acompanhamento',
    forma_pagamento: 'a forma combinada', vencimento: appointmentDate || 'a combinar', dados_pagamento: 'Os dados de pagamento serão enviados pela equipe.', numero_cliente: 'a confirmar', numero_caso: 'a confirmar', numero_parcela: 'a confirmar', nome_atendente: member?.name || 'Franciele Sofiati', texto_livre: 'a mensagem principal', mensagem_principal: 'a mensagem principal', informacao_complementar: 'Se houver qualquer dúvida, estamos à disposição.', acao_solicitada: 'responda quando puder', prazo_ou_proximo_passo: 'aguarde nosso próximo contato', horario_funcionamento: 'de segunda a sexta-feira, em horário comercial',
    // Legacy values remain supported while old saved templates are migrated gradually.
    assinatura_remetente: member?.name || 'Franciele Sofiati',
  };
}

export function placeholders(text) {
  const source = String(text || '');
  return [...new Set([
    ...[...source.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)].map((match) => match[1]),
    ...[...source.matchAll(/(?<!\{)\{([a-zA-Z0-9_]+)\}(?!\})/g)].map((match) => match[1]),
  ])];
}

// SQL-seeded models can contain the two literal characters "\\n". Normalize
// them once at the shared boundary for WhatsApp, email, previews, and copies.
export function normalizeMessageText(text) {
  return String(text || '')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\t/g, '\t');
}

export function renderTemplate(text, values) {
  return normalizeMessageText(text).replace(/\{\{([a-zA-Z0-9_]+)\}\}|\{([a-zA-Z0-9_]+)\}/g, (_, doubleKey, singleKey) => {
    const key = doubleKey || singleKey;
    const value = values?.[key];
    return value === undefined || value === null ? (doubleKey ? `{{${key}}}` : `{${key}}`) : String(value);
  }).replace(/\n{3,}/g, '\n\n').trim();
}

export function emailSubject(subject, templateName = 'Mensagem') {
  const taste = String(subject || templateName || 'Mensagem').replace(/^Franciele Sofiati\s*[·|-]?\s*/i, '').trim().split(/\s+/).slice(0, 3).join(' ') || 'Mensagem';
  return `Franciele Sofiati · ${taste}`;
}

export async function sendFormSubmitEmail({ recipient, subject, body, patient, sender }) {
  const { invoke } = await import('./lib');
  const result = await invoke('communication-email', {
    recipient,
    subject,
    body: normalizeMessageText(body).trim(),
    patient_name: patient?.full_name || patient?.preferred_name || '',
    sender,
  });
  if (result?.error || result?.status !== 'sent') throw new Error(result?.error || 'email_not_confirmed');
  return result;
}

export function missingPlaceholders(text, values) {
  return placeholders(text).filter((key) => !String(values?.[key] ?? '').trim());
}

export function placeholderLabel(key) {
  return STANDARD_PLACEHOLDERS.find(([name]) => name === key)?.[1] || key;
}
