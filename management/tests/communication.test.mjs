import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { emailSubject, normalizeMessageText, renderTemplate, valuesForPatient } from '../src/communicationTemplates.js';

const patient = {
  full_name: 'Ashlyn Ann Merrigan', preferred_name: 'Ashlyn', phone: '554399614069', email: 'team.ashtra.ai@gmail.com',
  address: { street: 'Rua das Acácias', number: '120', neighborhood: 'Centro', city: 'Londrina', state: 'PR' },
};
const member = { name: 'Franciele Sofiati', email: 'suportesofiati@gmail.com' };
const appointment = { starts_at: '2026-09-25T15:00:00-03:00', label: 'Revisão de manutenção' };

test('all seeded communication placeholders render for a complete Ashlyn fixture', () => {
  const source = [
    '202609150110_communication_system.sql',
    '202609150200_external_communication_templates.sql',
  ].map((file) => fs.readFileSync(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8')).join('\n');
  const values = valuesForPatient(patient, member, appointment);
  const keys = [...new Set([...source.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}|\{([a-zA-Z0-9_]+)\}/g)].map((match) => match[1] || match[2]))];
  assert.deepEqual(keys.filter((key) => values[key] === undefined), []);
  const rendered = renderTemplate(source, values);
  assert.doesNotMatch(rendered, /\{\{?[a-zA-Z0-9_]+\}?\}/);
  assert.match(rendered, /Ashlyn/);
  assert.match(rendered, /Franciele Sofiati/);
  assert.match(rendered, /\n\n/);
});

test('email subject keeps the Franciele Sofiati brand and a short human teaser', () => {
  assert.equal(emailSubject('', 'Cancelamento cuidadoso'), 'Franciele Sofiati · Cancelamento cuidadoso');
  assert.equal(emailSubject('Franciele Sofiati · Atualização do atendimento'), 'Franciele Sofiati · Atualização do atendimento');
});

test('escaped SQL line breaks become real WhatsApp line breaks', () => {
  const rendered = renderTemplate('Olá, {{nome}}.\\n\\nTudo bem?', { nome: 'Ashlyn' });
  assert.equal(rendered, 'Olá, Ashlyn.\n\nTudo bem?');
  assert.equal(normalizeMessageText('a\\nb\\tc'), 'a\nb\tc');
});
