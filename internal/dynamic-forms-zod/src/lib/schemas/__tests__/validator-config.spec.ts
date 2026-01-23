import { describe, it, expect } from 'vitest';
import { ValidatorConfigSchema } from '../validation/validator-config.schema';

describe('ValidatorConfigSchema', () => {
  describe('built-in validators', () => {
    it('should validate required validator', () => {
      const config = { type: 'required' };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate email validator', () => {
      const config = { type: 'email' };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate min validator with value', () => {
      const config = { type: 'min', value: 5 };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate max validator with expression', () => {
      const config = { type: 'max', expression: 'formValue.maxAllowed' };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate pattern validator', () => {
      const config = { type: 'pattern', value: '^[a-z]+$' };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('custom validators', () => {
    it('should validate custom validator with functionName', () => {
      const config = {
        type: 'custom',
        functionName: 'validateUsername',
        params: { minLength: 3 },
      };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate custom validator with expression', () => {
      const config = {
        type: 'custom',
        expression: 'fieldValue.length > 3',
        kind: 'customError',
      };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('async validators', () => {
    it('should validate async validator', () => {
      const config = {
        type: 'customAsync',
        functionName: 'checkEmailAvailability',
      };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject async validator without functionName', () => {
      const config = { type: 'customAsync' };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });

  describe('HTTP validators', () => {
    it('should validate HTTP validator', () => {
      const config = {
        type: 'customHttp',
        functionName: 'validateWithApi',
        params: { endpoint: '/api/validate' },
      };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('conditional validators', () => {
    it('should validate validator with fieldValue condition', () => {
      const config = {
        type: 'required',
        when: {
          type: 'fieldValue',
          fieldPath: 'otherField',
          operator: 'equals',
          value: 'yes',
        },
      };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate validator with nested AND condition', () => {
      const config = {
        type: 'required',
        when: {
          type: 'and',
          conditions: [
            { type: 'fieldValue', fieldPath: 'a', operator: 'equals', value: 1 },
            { type: 'fieldValue', fieldPath: 'b', operator: 'equals', value: 2 },
          ],
        },
      };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid configs', () => {
    it('should reject unknown validator type', () => {
      const config = { type: 'unknown' };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });
});
