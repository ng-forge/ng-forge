import { describe, expect, it } from 'vitest';
import { requiresTreeValidation } from './cross-field-detector';
import { ValidatorConfig } from '../../models/validation/validator-config';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';

const crossFieldWhen: ConditionalExpression = {
  type: 'javascript',
  expression: 'formValue.other === true',
};

const localWhen: ConditionalExpression = {
  type: 'javascript',
  expression: 'fieldValue !== ""',
};

describe('requiresTreeValidation()', () => {
  describe('custom validators', () => {
    it('returns true for a cross-field expression', () => {
      const config: ValidatorConfig = { type: 'custom', expression: 'fieldValue === formValue.password' };
      expect(requiresTreeValidation(config)).toBe(true);
    });

    it('returns true for a cross-field expression with a when condition', () => {
      const config: ValidatorConfig = {
        type: 'custom',
        expression: 'fieldValue === formValue.password',
        when: crossFieldWhen,
      };
      expect(requiresTreeValidation(config)).toBe(true);
    });

    it('returns false for a field-local expression', () => {
      const config: ValidatorConfig = { type: 'custom', expression: 'fieldValue.length > 3' };
      expect(requiresTreeValidation(config)).toBe(false);
    });

    it('returns false for a field-local expression with a cross-field when', () => {
      const config: ValidatorConfig = { type: 'custom', expression: 'fieldValue.length > 3', when: crossFieldWhen };
      expect(requiresTreeValidation(config)).toBe(false);
    });

    it('returns false for fn-based validators even with a cross-field when', () => {
      const config: ValidatorConfig = { type: 'custom', fn: () => null, when: crossFieldWhen };
      expect(requiresTreeValidation(config)).toBe(false);
    });

    it('returns false for functionName-based validators with a cross-field when', () => {
      const config: ValidatorConfig = { type: 'custom', functionName: 'myValidator', when: crossFieldWhen };
      expect(requiresTreeValidation(config)).toBe(false);
    });
  });

  describe('built-in validators', () => {
    it('returns true for a cross-field dynamic value expression', () => {
      const config: ValidatorConfig = { type: 'maxLength', expression: 'formValue.limit' };
      expect(requiresTreeValidation(config)).toBe(true);
    });

    it('returns true for a cross-field dynamic value expression with a when condition', () => {
      const config: ValidatorConfig = { type: 'maxLength', expression: 'formValue.limit', when: crossFieldWhen };
      expect(requiresTreeValidation(config)).toBe(true);
    });

    it('returns false for a static value with a cross-field when', () => {
      const config: ValidatorConfig = { type: 'maxLength', value: 20, when: crossFieldWhen };
      expect(requiresTreeValidation(config)).toBe(false);
    });

    it('returns false for a static value with a field-local when', () => {
      const config: ValidatorConfig = { type: 'maxLength', value: 20, when: localWhen };
      expect(requiresTreeValidation(config)).toBe(false);
    });

    it('returns false for a non-cross-field dynamic value expression with a when', () => {
      const config: ValidatorConfig = { type: 'min', expression: '18', when: crossFieldWhen };
      expect(requiresTreeValidation(config)).toBe(false);
    });

    it('returns false for required with a cross-field when', () => {
      const config: ValidatorConfig = { type: 'required', when: crossFieldWhen };
      expect(requiresTreeValidation(config)).toBe(false);
    });

    it('returns false for email with a cross-field when', () => {
      const config: ValidatorConfig = { type: 'email', when: crossFieldWhen };
      expect(requiresTreeValidation(config)).toBe(false);
    });

    it('returns false for a plain static built-in', () => {
      const config: ValidatorConfig = { type: 'minLength', value: 3 };
      expect(requiresTreeValidation(config)).toBe(false);
    });
  });

  describe('resource-based validators', () => {
    it('returns false for async validators with a cross-field when', () => {
      const config = { type: 'async', functionName: 'checkUsername', when: crossFieldWhen } as ValidatorConfig;
      expect(requiresTreeValidation(config)).toBe(false);
    });

    it('returns false for http validators with a cross-field when', () => {
      const config: ValidatorConfig = {
        type: 'http',
        http: { url: '/api/check', method: 'GET' },
        responseMapping: { validWhen: 'response.ok', errorKind: 'taken' },
        when: crossFieldWhen,
      };
      expect(requiresTreeValidation(config)).toBe(false);
    });

    it('returns false for async/http validators carrying a stray cross-field expression property', () => {
      const asyncConfig = { type: 'async', functionName: 'check', expression: 'formValue.other' } as unknown as ValidatorConfig;
      const httpConfig = {
        type: 'http',
        http: { url: '/api/check', method: 'GET' },
        responseMapping: { validWhen: 'response.ok', errorKind: 'taken' },
        expression: 'formValue.other',
      } as unknown as ValidatorConfig;

      expect(requiresTreeValidation(asyncConfig)).toBe(false);
      expect(requiresTreeValidation(httpConfig)).toBe(false);
    });
  });
});
