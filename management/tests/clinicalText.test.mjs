import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanStructuredRows, displayText, humanText, structuredParameters, structuredQuestions } from '../src/clinicalText.js';

test('clinical text renders scalar, array, object and JSON-string values without serialization artifacts', () => {
  assert.equal(humanText(null), '');
  assert.equal(humanText(undefined), '');
  assert.equal(humanText(['alergia', 'medicação']), 'alergia\nmedicação');
  assert.equal(displayText({ energy: '12 J', frequency: '1 Hz' }), 'Energia: 12 J\nFrequência: 1 Hz');
  assert.equal(displayText('["pele sensível", "usar proteção"]'), 'pele sensível\nusar proteção');
  assert.equal(displayText('{"notes":"Sem intercorrências"}'), 'Observações: Sem intercorrências');
  assert.equal(displayText('{malformed'), '{malformed');
  assert.equal(displayText({ detail: null }), '');
});

test('questionnaire rows support legacy strings and structured Supabase JSON without data loss on an unchanged save', () => {
  const legacy = ['Confirmou o uso de medicamentos?'];
  assert.deepEqual(structuredQuestions(legacy), [{ key: 'question-1', label: legacy[0], required: false, _legacy: 'string' }]);

  const saved = [{ question: 'Há alergias?', required: true, clinical_note: { review: 'anual' } }];
  const editorRows = structuredQuestions(saved);
  assert.equal(editorRows[0].label, 'Há alergias?');
  assert.equal(editorRows[0].clinical_note.review, 'anual');
  assert.deepEqual(saved, [{ question: 'Há alergias?', required: true, clinical_note: { review: 'anual' } }]);
  assert.deepEqual(cleanStructuredRows(editorRows, 'question'), [{ question: 'Há alergias?', required: true, clinical_note: { review: 'anual' }, key: 'question-1', label: 'Há alergias?' }]);
});

test('equipment parameter rows remain structured, editable and retain unknown JSON keys', () => {
  const saved = [{ parameter: 'Fluência', notes: '12 J/cm²', unit: 'J/cm²', limits: { min: 8, max: 16 } }];
  const editorRows = structuredParameters(saved);
  assert.equal(editorRows[0].name, 'Fluência');
  assert.equal(editorRows[0].value, '12 J/cm²');
  const edited = cleanStructuredRows([{ ...editorRows[0], value: '14 J/cm²' }], 'parameter');
  assert.deepEqual(edited, [{ parameter: 'Fluência', notes: '12 J/cm²', unit: 'J/cm²', limits: { min: 8, max: 16 }, name: 'Fluência', value: '14 J/cm²' }]);
});

test('empty and malformed structured values produce safe editable rows', () => {
  assert.deepEqual(structuredQuestions(null), []);
  assert.deepEqual(structuredParameters(undefined), []);
  assert.deepEqual(cleanStructuredRows([{ name: '  ', value: '  ' }], 'parameter'), []);
  assert.deepEqual(cleanStructuredRows([{ key: 'q', label: '  ', required: true }], 'question'), []);
});
