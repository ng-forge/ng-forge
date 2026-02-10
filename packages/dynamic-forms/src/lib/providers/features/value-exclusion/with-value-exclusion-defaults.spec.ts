import { describe, it, expect } from 'vitest';
import { withValueExclusionDefaults } from './with-value-exclusion-defaults';
import { VALUE_EXCLUSION_DEFAULTS } from './value-exclusion.token';
import { isDynamicFormFeature } from '../dynamic-form-feature';
import { ResolvedValueExclusionConfig } from '../../../models/value-exclusion-config';

describe('withValueExclusionDefaults', () => {
  describe('Feature structure', () => {
    it('should return a DynamicFormFeature with kind "value-exclusion"', () => {
      const feature = withValueExclusionDefaults();

      expect(feature.ɵkind).toBe('value-exclusion');
    });

    it('should contain providers array', () => {
      const feature = withValueExclusionDefaults();

      expect(feature.ɵproviders).toBeDefined();
      expect(Array.isArray(feature.ɵproviders)).toBe(true);
      expect(feature.ɵproviders.length).toBe(1);
    });

    it('should provide VALUE_EXCLUSION_DEFAULTS token', () => {
      const feature = withValueExclusionDefaults();
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: unknown };

      expect(provider.provide).toBe(VALUE_EXCLUSION_DEFAULTS);
    });
  });

  describe('Default config (no args)', () => {
    it('should default all exclusion rules to true', () => {
      const feature = withValueExclusionDefaults();
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: ResolvedValueExclusionConfig };

      expect(provider.useValue).toEqual({
        excludeValueIfHidden: true,
        excludeValueIfDisabled: true,
        excludeValueIfReadonly: true,
      });
    });
  });

  describe('Partial config overrides', () => {
    it('should allow disabling excludeValueIfHidden only', () => {
      const feature = withValueExclusionDefaults({ excludeValueIfHidden: false });
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: ResolvedValueExclusionConfig };

      expect(provider.useValue).toEqual({
        excludeValueIfHidden: false,
        excludeValueIfDisabled: true,
        excludeValueIfReadonly: true,
      });
    });

    it('should allow disabling excludeValueIfDisabled only', () => {
      const feature = withValueExclusionDefaults({ excludeValueIfDisabled: false });
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: ResolvedValueExclusionConfig };

      expect(provider.useValue).toEqual({
        excludeValueIfHidden: true,
        excludeValueIfDisabled: false,
        excludeValueIfReadonly: true,
      });
    });

    it('should allow disabling excludeValueIfReadonly only', () => {
      const feature = withValueExclusionDefaults({ excludeValueIfReadonly: false });
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: ResolvedValueExclusionConfig };

      expect(provider.useValue).toEqual({
        excludeValueIfHidden: true,
        excludeValueIfDisabled: true,
        excludeValueIfReadonly: false,
      });
    });

    it('should allow disabling all exclusion rules', () => {
      const feature = withValueExclusionDefaults({
        excludeValueIfHidden: false,
        excludeValueIfDisabled: false,
        excludeValueIfReadonly: false,
      });
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: ResolvedValueExclusionConfig };

      expect(provider.useValue).toEqual({
        excludeValueIfHidden: false,
        excludeValueIfDisabled: false,
        excludeValueIfReadonly: false,
      });
    });

    it('should treat explicit true the same as default', () => {
      const feature = withValueExclusionDefaults({ excludeValueIfHidden: true });
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: ResolvedValueExclusionConfig };

      expect(provider.useValue).toEqual({
        excludeValueIfHidden: true,
        excludeValueIfDisabled: true,
        excludeValueIfReadonly: true,
      });
    });
  });

  describe('isDynamicFormFeature compatibility', () => {
    it('should pass isDynamicFormFeature type guard', () => {
      const feature = withValueExclusionDefaults();

      expect(isDynamicFormFeature(feature)).toBe(true);
    });

    it('should have the required ɵkind property as a string', () => {
      const feature = withValueExclusionDefaults();

      expect(typeof feature.ɵkind).toBe('string');
    });

    it('should have the required ɵproviders property as an array', () => {
      const feature = withValueExclusionDefaults();

      expect(Array.isArray(feature.ɵproviders)).toBe(true);
    });
  });
});
