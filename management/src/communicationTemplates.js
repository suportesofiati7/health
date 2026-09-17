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
const dateValue = (value) => {
  if (!value) return '';
  const source = String(value);
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(source) ? new Date(`${source}T12:00:00-03:00`) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(parsed);
};
const timeValue = (value) => value ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '';
const textValue = (value) => String(value || '').trim();
const objectText = (value) => value && typeof value === 'object' ? Object.values(value).filter(Boolean).join(', ') : textValue(value);
const moneyValue = (cents) => Number.isFinite(Number(cents)) ? `R$ ${(Number(cents) / 100).toFixed(2).replace('.', ',')}` : '';

export function valuesForPatient(patient, member, appointment) {
  const first = firstName(patient);
  const appointmentDate = dateValue(appointment?.starts_at);
  const appointmentTime = timeValue(appointment?.starts_at);
  const address = patient?.address && typeof patient.address === 'object'
    ? [patient.address.street, patient.address.number, patient.address.neighborhood, patient.address.city, patient.address.state].filter(Boolean).join(', ')
    : '';
  const snapshot = appointment?.procedure_snapshot || {};
  const service = textValue(appointment?.label) || textValue(snapshot.name) || 'seu atendimento';
  const professional = textValue(appointment?.professional_name) || textValue(appointment?.professional?.name) || textValue(member?.name) || 'Franciele Sofiati';
  const birthDate = dateValue(patient?.birth_date);
  const financialValue = moneyValue(appointment?.total_cents ?? appointment?.price_cents ?? snapshot.price_cents);
  const generic = 'as informações necessárias para darmos continuidade ao atendimento';
  return {
    nome: first, primeiro_nome: first, nome_completo: textValue(patient?.full_name || patient?.preferred_name), telefone: textValue(patient?.phone), email: textValue(patient?.email),
    cpf: textValue(patient?.cpf), rg: textValue(patient?.rg), cns: textValue(patient?.cns), data_nascimento: birthDate,
    endereco: address, cidade: textValue(patient?.address?.city), estado: textValue(patient?.address?.state), ocupacao: textValue(patient?.occupation), convenio: textValue(patient?.insurance),
    contato_emergencia: objectText(patient?.emergency_contact), responsavel_legal: objectText(patient?.guardian),
    nome_atendente: professional, responsavel: professional, nome_profissional: professional, nome_empresa: 'Franciele Sofiati', data_hoje: dateValue(new Date()),
    data: appointmentDate || 'a combinar', hora: appointmentTime || 'a combinar', data_hora: appointmentDate && appointmentTime ? `${appointmentDate} às ${appointmentTime}` : 'a combinar',
    data_consulta: appointmentDate || 'a combinar', hora_consulta: appointmentTime || 'a combinar', local: address || 'Londrina, PR', local_ou_link: address || 'Londrina, PR', link: 'este canal', link_reuniao: 'o link será enviado pela equipe', link_localizacao: 'a localização será enviada pela equipe', link_feedback: 'o link será enviado pela equipe', link_avaliacao: 'o link será enviado pela equipe',
    tipo_servico: service, tipo_atendimento: service, procedimento: service, modalidade: textValue(appointment?.modality) || 'presencial', assunto: service, observacao: textValue(appointment?.notes) || 'Se precisar de qualquer esclarecimento, estamos à disposição.', contexto: service,
    lista_informacoes: generic, lista_documentos: 'os documentos solicitados', documento: 'o documento solicitado', informacao_solicitada: 'a informação solicitada', perguntas_iniciais: 'qual é a sua principal dúvida e como podemos ajudar', meio_envio: 'este WhatsApp',
    indicador: 'uma pessoa conhecida', orientacao_documento: 'Se precisar de ajuda, pode nos escrever por aqui.', orientacao: 'Siga as orientações recebidas e, em caso de dúvida, fale conosco.', informacoes_atendimento: 'Se precisar alterar alguma informação, avise-nos com antecedência.', informacoes_pagamento: 'Se já realizou o pagamento, pode nos enviar o comprovante por aqui.',
    resumo_proposta: service, valor: financialValue || 'conforme combinado', condicoes: 'As condições seguem a proposta apresentada.', proximos_passos: 'a próxima etapa do atendimento', opcoes_horarios: 'os horários disponíveis apresentados pela equipe', resultado: 'atendimento concluído conforme planejado', orientacoes_finais: 'Siga as orientações combinadas para os próximos dias.',
    pendencias: 'as informações pendentes', pendencia: 'as informações necessárias', proximo_passo: 'a próxima etapa do atendimento', informacao_ou_documento: 'as informações enviadas', prazo: 'o prazo combinado', data_limite_interna: appointmentDate || 'a combinar', protocolo: 'o protocolo do atendimento', procedimento: service, status: 'em acompanhamento',
    forma_pagamento: textValue(appointment?.payment_method) || 'a forma combinada', vencimento: textValue(appointment?.due_on) ? dateValue(appointment.due_on) : appointmentDate || 'a combinar', dados_pagamento: 'Os dados de pagamento serão enviados pela equipe.', numero_cliente: textValue(patient?.id).slice(0, 8), numero_caso: textValue(appointment?.id).slice(0, 8), numero_parcela: 'a confirmar', texto_livre: '', mensagem_principal: '', informacao_complementar: 'Se houver qualquer dúvida, estamos à disposição.', acao_solicitada: 'responda quando puder', prazo_ou_proximo_passo: 'aguarde nosso próximo contato', horario_funcionamento: 'de segunda a sexta-feira, em horário comercial',
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
