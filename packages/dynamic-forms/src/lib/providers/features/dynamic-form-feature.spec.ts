import { describe, it, expect } from 'vitest';
import { createFeature, isDynamicFormFeature, DynamicFormFeature } from './dynamic-form-feature';
import { FieldTypeDefinition } from '../../models/field-type';

describe('DynamicFormFeature', () => {
  describe('createFeature', () => {
    it('should create a feature with the specified kind', () => {
      const feature = createFeature('test', []);

      expect(feature.ɵkind).toBe('test');
    });

    it('should include the provided providers', () => {
      const providers = [{ provide: 'TOKEN', useValue: 'value' }];
      const feature = createFeature('test', providers);

      expect(feature.ɵproviders).toBe(providers);
    });

    it('should create features with different kinds', () => {
      const loggerFeature = createFeature('logger', []);
      const customFeature = createFeature('custom', []);

      expect(loggerFeature.ɵkind).toBe('logger');
      expect(customFeature.ɵkind).toBe('custom');
    });
  });

  describe('isDynamicFormFeature', () => {
    it('should return true for valid DynamicFormFeature objects', () => {
      const feature = createFeature('test', []);

      expect(isDynamicFormFeature(feature)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isDynamicFormFeature(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isDynamicFormFeature(undefined)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isDynamicFormFeature('string')).toBe(false);
      expect(isDynamicFormFeature(123)).toBe(false);
      expect(isDynamicFormFeature(true)).toBe(false);
    });

    it('should return false for objects without ɵkind', () => {
      expect(isDynamicFormFeature({ name: 'test' })).toBe(false);
    });

    it('should return false for objects without ɵproviders', () => {
      expect(isDynamicFormFeature({ ɵkind: 'test' })).toBe(false);
    });

    it('should return false for objects with non-string ɵkind', () => {
      expect(isDynamicFormFeature({ ɵkind: 123, ɵproviders: [] })).toBe(false);
    });

    it('should return false for objects with non-array ɵproviders', () => {
      expect(isDynamicFormFeature({ ɵkind: 'test', ɵproviders: 'not-array' })).toBe(false);
    });

    it('should return false for FieldTypeDefinition objects', () => {
      const fieldType: FieldTypeDefinition = {
        name: 'test',
        loadComponent: () => Promise.resolve({}),
        mapper: () => ({}),
        valueHandling: 'include',
      };

      expect(isDynamicFormFeature(fieldType)).toBe(false);
    });

    it('should distinguish between FieldTypeDefinition and DynamicFormFeature', () => {
      const fieldType: FieldTypeDefinition = {
        name: 'row',
        loadComponent: () => Promise.resolve({}),
        mapper: () => ({}),
        valueHandling: 'flatten',
      };

      const feature: DynamicFormFeature = createFeature('logger', []);

      expect(isDynamicFormFeature(fieldType)).toBe(false);
      expect(isDynamicFormFeature(feature)).toBe(true);
    });
  });
});
