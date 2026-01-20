import { describe, it, expect } from 'vitest';
import { ConditionalExpressionSchema } from '../logic/conditional-expression.schema';

describe('ConditionalExpressionSchema', () => {
  describe('fieldValue conditions', () => {
    it('should validate fieldValue with equals operator', () => {
      const config = {
        type: 'fieldValue',
        fieldPath: 'status',
        operator: 'equals',
        value: 'active',
      };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate fieldValue with numeric comparison', () => {
      const config = {
        type: 'fieldValue',
        fieldPath: 'age',
        operator: 'greaterOrEqual',
        value: 18,
      };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate fieldValue with contains operator', () => {
      const config = {
        type: 'fieldValue',
        fieldPath: 'email',
        operator: 'contains',
        value: '@',
      };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate fieldValue with matches operator', () => {
      const config = {
        type: 'fieldValue',
        fieldPath: 'phone',
        operator: 'matches',
        value: '^\\d{10}$',
      };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('formValue conditions', () => {
    it('should validate formValue condition', () => {
      const config = {
        type: 'formValue',
        operator: 'notEquals',
        value: null,
      };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('custom/javascript conditions', () => {
    it('should validate custom condition with expression', () => {
      const config = {
        type: 'custom',
        expression: 'fieldValue > formValue.minValue',
      };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate javascript condition', () => {
      const config = {
        type: 'javascript',
        expression: 'fieldValue.split(",").length > 2',
      };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('composite conditions', () => {
    it('should validate AND condition', () => {
      const config = {
        type: 'and',
        conditions: [
          { type: 'fieldValue', fieldPath: 'a', operator: 'equals', value: 1 },
          { type: 'fieldValue', fieldPath: 'b', operator: 'equals', value: 2 },
        ],
      };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate OR condition', () => {
      const config = {
        type: 'or',
        conditions: [
          { type: 'fieldValue', fieldPath: 'role', operator: 'equals', value: 'admin' },
          { type: 'fieldValue', fieldPath: 'role', operator: 'equals', value: 'superadmin' },
        ],
      };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate deeply nested conditions', () => {
      const config = {
        type: 'and',
        conditions: [
          {
            type: 'or',
            conditions: [
              { type: 'fieldValue', fieldPath: 'a', operator: 'equals', value: 1 },
              { type: 'fieldValue', fieldPath: 'b', operator: 'equals', value: 2 },
            ],
          },
          { type: 'fieldValue', fieldPath: 'c', operator: 'greater', value: 0 },
        ],
      };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid configs', () => {
    it('should reject unknown condition type', () => {
      const config = { type: 'unknown' };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should reject invalid operator', () => {
      const config = {
        type: 'fieldValue',
        fieldPath: 'test',
        operator: 'invalid',
        value: 'test',
      };
      const result = ConditionalExpressionSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });
});
