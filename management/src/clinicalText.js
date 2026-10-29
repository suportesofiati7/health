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
