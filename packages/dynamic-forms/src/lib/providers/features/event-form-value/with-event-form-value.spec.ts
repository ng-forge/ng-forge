import { describe, it, expect } from 'vitest';
import { withEventFormValue } from './with-event-form-value';
import { EMIT_FORM_VALUE_ON_EVENTS } from './emit-form-value.token';

describe('withEventFormValue', () => {
  describe('Feature structure', () => {
    it('should return a DynamicFormFeature with kind "event-form-value"', () => {
      const feature = withEventFormValue();

      expect(feature.ɵkind).toBe('event-form-value');
    });

    it('should contain providers array', () => {
      const feature = withEventFormValue();

      expect(feature.ɵproviders).toBeDefined();
      expect(Array.isArray(feature.ɵproviders)).toBe(true);
      expect(feature.ɵproviders.length).toBe(1);
    });

    it('should provide EMIT_FORM_VALUE_ON_EVENTS token', () => {
      const feature = withEventFormValue();
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: unknown };

      expect(provider.provide).toBe(EMIT_FORM_VALUE_ON_EVENTS);
    });

    it('should provide EMIT_FORM_VALUE_ON_EVENTS with value true', () => {
      const feature = withEventFormValue();
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: boolean };

      expect(provider.useValue).toBe(true);
    });
  });

  describe('isDynamicFormFeature compatibility', () => {
    it('should have the required ɵkind property as a string', () => {
      const feature = withEventFormValue();

      expect(typeof feature.ɵkind).toBe('string');
    });

    it('should have the required ɵproviders property as an array', () => {
      const feature = withEventFormValue();

      expect(Array.isArray(feature.ɵproviders)).toBe(true);
    });
  });
});
