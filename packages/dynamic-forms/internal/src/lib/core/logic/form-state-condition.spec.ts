import { describe, expect, it } from 'vitest';
import { evaluateFormStateCondition } from './form-state-condition';

describe('evaluateFormStateCondition', () => {
  const base = { formValid: () => true, formSubmitting: () => false };

  it('formInvalid reflects negated validity', () => {
    expect(evaluateFormStateCondition('formInvalid', { ...base, formValid: () => false })).toBe(true);
    expect(evaluateFormStateCondition('formInvalid', { ...base, formValid: () => true })).toBe(false);
  });

  it('formSubmitting reflects the submitting flag', () => {
    expect(evaluateFormStateCondition('formSubmitting', { ...base, formSubmitting: () => true })).toBe(true);
    expect(evaluateFormStateCondition('formSubmitting', { ...base, formSubmitting: () => false })).toBe(false);
  });

  it('pageInvalid uses currentPageValid, and is false when it is absent', () => {
    expect(evaluateFormStateCondition('pageInvalid', { ...base, currentPageValid: () => false })).toBe(true);
    expect(evaluateFormStateCondition('pageInvalid', { ...base, currentPageValid: () => true })).toBe(false);
    expect(evaluateFormStateCondition('pageInvalid', base)).toBe(false);
  });

  it('does not read formValid when evaluating formSubmitting (cycle-safety on value fields)', () => {
    let validRead = false;
    evaluateFormStateCondition('formSubmitting', {
      formValid: () => {
        validRead = true;
        return true;
      },
      formSubmitting: () => false,
    });
    expect(validRead).toBe(false);
  });
});
