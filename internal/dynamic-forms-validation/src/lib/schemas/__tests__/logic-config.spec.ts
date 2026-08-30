import { describe, it, expect } from 'vitest';
import { LogicConfigSchema } from '../logic/logic-config.schema';

describe('LogicConfigSchema', () => {
  describe('state logic', () => {
    it('should validate hidden logic with boolean condition', () => {
      const config = { type: 'hidden', condition: true };
      const result = LogicConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate disabled logic with form state condition', () => {
      const config = { type: 'disabled', condition: 'formInvalid' };
      const result = LogicConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate readonly logic with fieldValue condition', () => {
      const config = {
        type: 'readonly',
        condition: {
          type: 'fieldValue',
          fieldPath: 'locked',
          operator: 'equals',
          value: true,
        },
      };
      const result = LogicConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate required logic with debounced trigger', () => {
      const config = {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'category',
          operator: 'equals',
          value: 'required',
        },
        trigger: 'debounced',
        debounceMs: 300,
      };
      const result = LogicConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('derivation logic', () => {
    it('should validate derivation with static value', () => {
      const config = {
        type: 'derivation',
        value: 'staticValue',
      };
      const result = LogicConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate derivation with expression', () => {
      const config = {
        type: 'derivation',
        expression: 'formValue.price * formValue.quantity',
        dependsOn: ['price', 'quantity'],
      };
      const result = LogicConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate derivation with functionName', () => {
      const config = {
        type: 'derivation',
        functionName: 'computeFullName',
        debugName: 'Full name derivation',
      };
      const result = LogicConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate derivation with condition', () => {
      const config = {
        type: 'derivation',
        expression: 'formValue.total * 0.1',
        condition: {
          type: 'fieldValue',
          fieldPath: 'total',
          operator: 'greater',
          value: 100,
        },
      };
      const result = LogicConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate debounced derivation', () => {
      const config = {
        type: 'derivation',
        functionName: 'searchAsync',
        trigger: 'debounced',
        debounceMs: 500,
      };
      const result = LogicConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid configs', () => {
    it('should reject invalid state type', () => {
      const config = { type: 'invalid', condition: true };
      const result = LogicConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should accept derivation without value/expression/functionName (minimal config)', () => {
      // Derivations are self-targeting, so only 'type' is required
      const config = { type: 'derivation' };
      const result = LogicConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });
});
