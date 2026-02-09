import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mapFieldToInputs } from './field-mapper';
import { FieldDef } from '../../definitions/base';
import { FieldTypeDefinition } from '../../models/field-type';
import { createPropertyOverrideStore, PROPERTY_OVERRIDE_STORE } from '../../core/property-derivation/property-override-store';

describe('mapFieldToInputs', () => {
  let registry: Map<string, FieldTypeDefinition>;

  beforeEach(() => {
    registry = new Map<string, FieldTypeDefinition>();
    TestBed.configureTestingModule({
      providers: [{ provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore }],
    });
  });

  function run<T>(fn: () => T): T {
    return TestBed.runInInjectionContext(fn);
  }

  describe('custom mapper', () => {
    it('should use custom mapper when field type has one', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({ custom: 'result' })));

      registry.set('input', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'input', key: 'email' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalledWith(field);
      expect(resultSignal()).toEqual({ custom: 'result' });
    });

    it('should pass field definition to custom mapper', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('select', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = {
        type: 'select',
        key: 'country',
        label: 'Country',
      };

      run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalledWith(field);
    });
  });

  describe('base mapper fallback', () => {
    it('should use base mapper when no custom mapper defined but has loadComponent', () => {
      registry.set('input', {
        name: 'input',
        loadComponent: () => Promise.resolve({} as any),
        // No mapper defined - should fall back to base mapper
      });

      const field: FieldDef<any> = { type: 'input', key: 'name' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));

      // Base mapper should return a signal
      expect(resultSignal).toBeDefined();
      expect(typeof resultSignal).toBe('function'); // Signal is a function
      // Calling the signal should return an object
      const result = resultSignal();
      expect(typeof result).toBe('object');
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should handle fields without registry entry using base mapper', () => {
      const field: FieldDef<any> = { type: 'unknown', key: 'test' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));

      expect(resultSignal).toBeDefined();
      expect(typeof resultSignal).toBe('function'); // Signal is a function
      const result = resultSignal();
      expect(typeof result).toBe('object');
    });
  });

  describe('componentless fields', () => {
    it('should return undefined for componentless fields (no mapper and no loadComponent)', () => {
      registry.set('hidden', {
        name: 'hidden',
        valueHandling: 'include',
        // No mapper and no loadComponent - componentless field
      });

      const field: FieldDef<any> = { type: 'hidden', key: 'id', value: 'test-id' };
      const result = run(() => mapFieldToInputs(field, registry));

      // Should return undefined for componentless fields - nothing to map
      expect(result).toBeUndefined();
    });

    it('should return undefined for all componentless field types', () => {
      registry.set('hidden', {
        name: 'hidden',
        valueHandling: 'include',
        // No mapper and no loadComponent
      });

      const field1: FieldDef<any> = { type: 'hidden', key: 'id1', value: 'val1' };
      const field2: FieldDef<any> = { type: 'hidden', key: 'id2', value: 'val2' };

      expect(run(() => mapFieldToInputs(field1, registry))).toBeUndefined();
      expect(run(() => mapFieldToInputs(field2, registry))).toBeUndefined();
    });

    it('should not call base mapper for componentless fields', () => {
      registry.set('hidden', {
        name: 'hidden',
        valueHandling: 'include',
        // No mapper and no loadComponent
      });

      const field: FieldDef<any> = { type: 'hidden', key: 'id', value: 123 };
      const result = run(() => mapFieldToInputs(field, registry));

      // Undefined for componentless fields - base mapper should not be called
      expect(result).toBeUndefined();
    });
  });

  describe('field type resolution', () => {
    it('should lookup field type from registry', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('email', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'email', key: 'userEmail' };
      run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalled();
    });

    it('should handle case-sensitive type names', () => {
      const mapper1 = vi.fn().mockReturnValue(computed(() => ({})));
      const mapper2 = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('Input', { component: {} as any, mapper: mapper1 });
      registry.set('input', { component: {} as any, mapper: mapper2 });

      const field1: FieldDef<any> = { type: 'Input', key: 'field1' };
      const field2: FieldDef<any> = { type: 'input', key: 'field2' };

      run(() => mapFieldToInputs(field1, registry));
      run(() => mapFieldToInputs(field2, registry));

      expect(mapper1).toHaveBeenCalledTimes(1);
      expect(mapper2).toHaveBeenCalledTimes(1);
    });
  });

  describe('inputs generation', () => {
    it('should return inputs signal', () => {
      const customMapper = (): Signal<Record<string, unknown>> =>
        computed(() => ({
          field: { key: 'test' },
          label: 'Test Label',
        }));

      registry.set('custom', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'custom', key: 'test' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));
      const result = resultSignal(); // Call signal to get inputs

      expect(Object.keys(result)).toHaveLength(2);
      expect(result).toHaveProperty('field');
      expect(result).toHaveProperty('label', 'Test Label');
    });

    it('should handle empty inputs object', () => {
      const customMapper = (): Signal<Record<string, unknown>> => computed(() => ({}));

      registry.set('minimal', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'minimal', key: 'test' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));

      expect(resultSignal()).toEqual({});
    });
  });

  describe('complex field scenarios', () => {
    it('should handle fields with multiple properties', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('complex', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = {
        type: 'complex',
        key: 'data',
        label: 'Data Field',
        placeholder: 'Enter data',
        required: true,
        disabled: false,
      };

      run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalledWith(field);
      expect(customMapper.mock.calls[0][0]).toEqual(field);
    });

    it('should handle fields with nested structures', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('nested', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = {
        type: 'nested',
        key: 'parent',
        props: {
          validation: { min: 0, max: 100 },
          formatting: { decimals: 2 },
        },
      };

      run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalledWith(field);
    });
  });

  describe('mapper function interface', () => {
    it('should call mapper with field as single argument', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('test', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'test', key: 'field' };
      run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalledTimes(1);
      expect(customMapper.mock.calls[0]).toHaveLength(1);
      expect(customMapper.mock.calls[0][0]).toBe(field);
    });

    it('should use mapper return value (signal) directly', () => {
      const expectedInputs = {
        a: 1,
        b: 2,
        c: 3,
      };

      const signalInstance = computed(() => expectedInputs);
      const customMapper = () => signalInstance;

      registry.set('test', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'test', key: 'field' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));

      // The result should be the same signal instance
      expect(resultSignal).toBe(signalInstance);
      // Calling the signal should return the expected inputs
      expect(resultSignal()).toEqual(expectedInputs);
    });
  });

  describe('registry integration', () => {
    it('should support multiple field types in registry', () => {
      const mapper1 = vi.fn().mockReturnValue(computed(() => ({ type1: true })));
      const mapper2 = vi.fn().mockReturnValue(computed(() => ({ type2: true })));
      const mapper3 = vi.fn().mockReturnValue(computed(() => ({ type3: true })));

      registry.set('type1', { component: {} as any, mapper: mapper1 });
      registry.set('type2', { component: {} as any, mapper: mapper2 });
      registry.set('type3', { component: {} as any, mapper: mapper3 });

      run(() => mapFieldToInputs({ type: 'type1', key: 'f1' }, registry));
      run(() => mapFieldToInputs({ type: 'type2', key: 'f2' }, registry));
      run(() => mapFieldToInputs({ type: 'type3', key: 'f3' }, registry));

      expect(mapper1).toHaveBeenCalledTimes(1);
      expect(mapper2).toHaveBeenCalledTimes(1);
      expect(mapper3).toHaveBeenCalledTimes(1);
    });

    it('should handle empty registry gracefully', () => {
      const emptyRegistry = new Map<string, FieldTypeDefinition>();
      const field: FieldDef<any> = { type: 'unknown', key: 'test' };

      const resultSignal = run(() => mapFieldToInputs(field, emptyRegistry));

      expect(resultSignal).toBeDefined();
      expect(typeof resultSignal).toBe('function'); // Signal is a function
      const result = resultSignal();
      expect(typeof result).toBe('object');
    });
  });
});
