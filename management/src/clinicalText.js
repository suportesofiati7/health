const labels = {
  price: 'Preço', official_sources: 'Fontes consultadas', indications: 'Indicações', benefits: 'Benefícios', contraindications: 'Quando não realizar', risks: 'Possíveis riscos', precautions: 'Cuidados e precauções',
  products: 'Produtos', equipment: 'Equipamentos', consumables: 'Materiais descartáveis',
  consent: 'Consentimento', photos: 'Fotografias', signatures: 'Assinaturas', notes: 'Observações',
  professionals: 'Profissionais habilitados', status: 'Situação', name: 'Nome', title: 'Título',
  value: 'Valor', unit: 'Unidade', question: 'Pergunta', answer: 'Resposta', description: 'Descrição',
  url: 'Endereço da fonte', source: 'Fonte', raw: 'Informação registrada',
  full_name: 'Nome completo', birth_date: 'Data de nascimento', selected_procedures: 'Procedimentos selecionados',
  form_version: 'Versão do formulário', language: 'Idioma', payload: 'Respostas do formulário',
  intensity: 'Intensidade', frequency: 'Frequência', energy: 'Energia', fluence: 'Fluência',
};
export const fieldLabel = (key) => labels[key] || String(key).replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
export function humanText(value) {
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value)) return value.map(humanText).filter(Boolean).join('\n');
  if (typeof value === 'object') return Object.entries(value).map(([key, item]) => {
    const text = humanText(item); return text ? `${fieldLabel(key)}: ${text}` : '';
  }).filter(Boolean).join('\n');
  return String(value);
}
// Notes stay readable; existing structured equipment settings remain intact.
export function parameterNotes(parameters) { return typeof parameters === 'object' ? String(parameters?.notes || '') : String(parameters || ''); }

export function displayText(value) {
  if (typeof value !== 'string') return humanText(value);
  const trimmed = value.trim();
  if (!/^[{[]/.test(trimmed)) return value;
  try { return humanText(JSON.parse(trimmed)); } catch { return value; }
}

const arrayValue = (value) => Array.isArray(value) ? value : value == null || value === '' ? [] : [value];

export function structuredQuestions(value) {
  return arrayValue(value).map((item, index) => {
    if (typeof item === 'string') return { key: `question-${index + 1}`, label: item, required: false, _legacy: 'string' };
    if (item && typeof item === 'object') return {
      ...item,
      key: item.key || `question-${index + 1}`,
      // Some legacy records store the question itself as a JSON object.
      // Normalize only the editable view; an untouched row is restored verbatim on save.
      label: displayText(item.label ?? item.question ?? item.text ?? item),
      required: Boolean(item.required),
    };
    return { key: `question-${index + 1}`, label: displayText(item), required: false, _legacy: 'scalar' };
  });
}

export function structuredParameters(value) {
  return arrayValue(value).map((item, index) => {
    if (typeof item === 'string') return { name: `Parâmetro ${index + 1}`, value: item, _legacy: 'string' };
    if (item && typeof item === 'object') return {
      ...item,
      name: displayText(item.name ?? item.label ?? item.parameter ?? `Parâmetro ${index + 1}`),
      value: displayText(item.value ?? item.notes ?? item.description ?? ''),
    };
    return { name: `Parâmetro ${index + 1}`, value: displayText(item), _legacy: 'scalar' };
  });
}

export function cleanStructuredRows(rows, kind) {
  return (rows || []).map((row) => {
    const next = { ...row };
    delete next._legacy;
    if (kind === 'question') {
      // Once the user changes the normalized editor value, avoid retaining a
      // competing legacy object in question/text that downstream consumers may pick first.
      delete next.question; delete next.text;
      next.key = displayText(next.key).trim(); next.label = displayText(next.label).trim(); next.required = Boolean(next.required);
    } else {
      delete next.parameter; delete next.notes; delete next.description;
      next.name = displayText(next.name).trim(); next.value = displayText(next.value).trim();
    }
    return next;
  }).filter((row) => kind === 'question' ? row.label : row.name || row.value);
}
