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

export function valuesForPatient(patient, member) {
  return {
    nome: firstName(patient), nome_completo: patient?.full_name || '', telefone: patient?.phone || '', email: patient?.email || '',
    nome_atendente: member?.name || '', responsavel: member?.name || '', nome_empresa: 'Franciele Sofiatis', data_hoje: new Intl.DateTimeFormat('pt-BR').format(new Date()),
    // Legacy values remain supported while old saved templates are migrated gradually.
    primeiro_nome: firstName(patient), assinatura_remetente: member?.name || 'Franciele Sofiatis',
  };
}

export function placeholders(text) {
  const source = String(text || '');
  return [...new Set([
    ...[...source.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)].map((match) => match[1]),
    ...[...source.matchAll(/(?<!\{)\{([a-zA-Z0-9_]+)\}(?!\})/g)].map((match) => match[1]),
  ])];
}

export function renderTemplate(text, values) {
  return String(text || '').replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    const value = values?.[key];
    return value === undefined || value === null ? `{{${key}}}` : String(value);
  }).replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
    const value = values?.[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  }).replace(/\n{3,}/g, '\n\n').trim();
}

export function missingPlaceholders(text, values) {
  return placeholders(text).filter((key) => !String(values?.[key] ?? '').trim());
}

export function placeholderLabel(key) {
  return STANDARD_PLACEHOLDERS.find(([name]) => name === key)?.[1] || key;
}
