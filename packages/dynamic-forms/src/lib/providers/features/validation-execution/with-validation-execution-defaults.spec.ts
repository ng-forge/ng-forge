import { describe, it, expect } from 'vitest';
import { withValidationExecutionDefaults } from './with-validation-execution-defaults';
import { VALIDATION_EXECUTION_DEFAULTS } from './validation-execution.token';
import { isDynamicFormFeature } from '../dynamic-form-feature';
import { ResolvedValidationExecutionConfig } from '../../../models/validation-execution-config';

describe('withValidationExecutionDefaults', () => {
  describe('Feature structure', () => {
    it('should return a DynamicFormFeature with kind "validation-execution"', () => {
      const feature = withValidationExecutionDefaults();

      expect(feature.ɵkind).toBe('validation-execution');
    });

    it('should contain a providers array of length 1', () => {
      const feature = withValidationExecutionDefaults();

      expect(feature.ɵproviders).toBeDefined();
      expect(Array.isArray(feature.ɵproviders)).toBe(true);
      expect(feature.ɵproviders.length).toBe(1);
    });

    it('should provide VALIDATION_EXECUTION_DEFAULTS token', () => {
      const feature = withValidationExecutionDefaults();
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: unknown };

      expect(provider.provide).toBe(VALIDATION_EXECUTION_DEFAULTS);
    });
  });

  describe('Default config (no args)', () => {
    it('should default validateWhenHidden to false', () => {
      const feature = withValidationExecutionDefaults();
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: ResolvedValidationExecutionConfig };

      expect(provider.useValue).toEqual({ validateWhenHidden: false });
    });
  });

  describe('Partial config overrides', () => {
    it('should accept validateWhenHidden: true to opt back in to legacy behavior', () => {
      const feature = withValidationExecutionDefaults({ validateWhenHidden: true });
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: ResolvedValidationExecutionConfig };

      expect(provider.useValue).toEqual({ validateWhenHidden: true });
    });

    it('should treat explicit false the same as default', () => {
      const feature = withValidationExecutionDefaults({ validateWhenHidden: false });
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: ResolvedValidationExecutionConfig };

      expect(provider.useValue).toEqual({ validateWhenHidden: false });
    });
  });

  describe('isDynamicFormFeature compatibility', () => {
    it('should pass isDynamicFormFeature type guard', () => {
      const feature = withValidationExecutionDefaults();

      expect(isDynamicFormFeature(feature)).toBe(true);
    });
  });
});
