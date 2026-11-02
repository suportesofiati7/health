import test from 'node:test';
import assert from 'node:assert/strict';
import { cpfValidationError, intakeErrorMessage } from '../../js/core/form-delivery.js';

test('CPF accepts formatted and unformatted valid values and distinguishes length from checksum errors', () => {
  for (const value of ['52998224725', '529.982.247-25', ' 529.982.247-25 ']) assert.equal(cpfValidationError(value), null);
  for (const value of ['', '5299822472', '529982247255']) assert.equal(cpfValidationError(value), 'cpf_length');
  for (const value of ['52998224724', '11111111111', '00000000000']) {
    assert.equal(cpfValidationError(value), 'cpf');
    assert.match(intakeErrorMessage({ code: cpfValidationError(value) }), /verificadores/);
    assert.doesNotMatch(intakeErrorMessage({ code: cpfValidationError(value) }), /11 dígitos/);
  }
});
