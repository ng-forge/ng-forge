import { describe, it, expect, vi } from 'vitest';
import { mapFieldToBindings } from './field-mapper';
import { FieldDef } from '../../definitions/base';
import { FieldTypeDefinition } from '../../models/field-type';
import { Binding } from '@angular/core';

describe('mapFieldToBindings', () => {
  let registry: Map<string, FieldTypeDefinition>;

  beforeEach(() => {
    registry = new Map<string, FieldTypeDefinition>();
  });

  describe('custom mapper', () => {
    it('should use custom mapper when field type has one', () => {
      const customMapper = vi.fn().mockReturnValue([{ provide: 'custom', useValue: 'result' }] as Binding[]);

      registry.set('input', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'input', key: 'email' };
      const result = mapFieldToBindings(field, registry);

      expect(customMapper).toHaveBeenCalledWith(field);
      expect(result).toEqual([{ provide: 'custom', useValue: 'result' }]);
    });

    it('should pass field definition to custom mapper', () => {
      const customMapper = vi.fn().mockReturnValue([] as Binding[]);

      registry.set('select', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = {
        type: 'select',
        key: 'country',
        label: 'Country',
      };

      mapFieldToBindings(field, registry);

      expect(customMapper).toHaveBeenCalledWith(field);
    });
  });

  describe('base mapper fallback', () => {
    it('should use base mapper when no custom mapper defined', () => {
      registry.set('input', {
        component: {} as any,
        // No mapper defined
      });

      const field: FieldDef<any> = { type: 'input', key: 'name' };
      const result = mapFieldToBindings(field, registry);

      // Base mapper should create bindings for common properties
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle fields without registry entry using base mapper', () => {
      const field: FieldDef<any> = { type: 'unknown', key: 'test' };
      const result = mapFieldToBindings(field, registry);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('field type resolution', () => {
    it('should lookup field type from registry', () => {
      const customMapper = vi.fn().mockReturnValue([]);

      registry.set('email', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'email', key: 'userEmail' };
      mapFieldToBindings(field, registry);

      expect(customMapper).toHaveBeenCalled();
    });

    it('should handle case-sensitive type names', () => {
      const mapper1 = vi.fn().mockReturnValue([]);
      const mapper2 = vi.fn().mockReturnValue([]);

      registry.set('Input', { component: {} as any, mapper: mapper1 });
      registry.set('input', { component: {} as any, mapper: mapper2 });

      const field1: FieldDef<any> = { type: 'Input', key: 'field1' };
      const field2: FieldDef<any> = { type: 'input', key: 'field2' };

      mapFieldToBindings(field1, registry);
      mapFieldToBindings(field2, registry);

      expect(mapper1).toHaveBeenCalledTimes(1);
      expect(mapper2).toHaveBeenCalledTimes(1);
    });
  });

  describe('binding generation', () => {
    it('should return bindings array', () => {
      const customMapper = () =>
        [
          { provide: 'field', useValue: { key: 'test' } },
          { provide: 'label', useValue: 'Test Label' },
        ] as Binding[];

      registry.set('custom', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'custom', key: 'test' };
      const result = mapFieldToBindings(field, registry);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('provide', 'field');
      expect(result[1]).toHaveProperty('provide', 'label');
    });

    it('should handle empty bindings array', () => {
      const customMapper = () => [] as Binding[];

      registry.set('minimal', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'minimal', key: 'test' };
      const result = mapFieldToBindings(field, registry);

      expect(result).toEqual([]);
    });
  });

  describe('complex field scenarios', () => {
    it('should handle fields with multiple properties', () => {
      const customMapper = vi.fn().mockReturnValue([]);

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

      mapFieldToBindings(field, registry);

      expect(customMapper).toHaveBeenCalledWith(field);
      expect(customMapper.mock.calls[0][0]).toEqual(field);
    });

    it('should handle fields with nested structures', () => {
      const customMapper = vi.fn().mockReturnValue([]);

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

      mapFieldToBindings(field, registry);

      expect(customMapper).toHaveBeenCalledWith(field);
    });
  });

  describe('mapper function interface', () => {
    it('should call mapper with field as single argument', () => {
      const customMapper = vi.fn().mockReturnValue([]);

      registry.set('test', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'test', key: 'field' };
      mapFieldToBindings(field, registry);

      expect(customMapper).toHaveBeenCalledTimes(1);
      expect(customMapper.mock.calls[0]).toHaveLength(1);
      expect(customMapper.mock.calls[0][0]).toBe(field);
    });

    it('should use mapper return value as-is', () => {
      const expectedBindings = [
        { provide: 'a', useValue: 1 },
        { provide: 'b', useValue: 2 },
        { provide: 'c', useValue: 3 },
      ] as Binding[];

      const customMapper = () => expectedBindings;

      registry.set('test', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'test', key: 'field' };
      const result = mapFieldToBindings(field, registry);

      expect(result).toBe(expectedBindings);
    });
  });

  describe('registry integration', () => {
    it('should support multiple field types in registry', () => {
      const mapper1 = vi.fn().mockReturnValue([{ provide: 'type1', useValue: true }]);
      const mapper2 = vi.fn().mockReturnValue([{ provide: 'type2', useValue: true }]);
      const mapper3 = vi.fn().mockReturnValue([{ provide: 'type3', useValue: true }]);

      registry.set('type1', { component: {} as any, mapper: mapper1 });
      registry.set('type2', { component: {} as any, mapper: mapper2 });
      registry.set('type3', { component: {} as any, mapper: mapper3 });

      mapFieldToBindings({ type: 'type1', key: 'f1' }, registry);
      mapFieldToBindings({ type: 'type2', key: 'f2' }, registry);
      mapFieldToBindings({ type: 'type3', key: 'f3' }, registry);

      expect(mapper1).toHaveBeenCalledTimes(1);
      expect(mapper2).toHaveBeenCalledTimes(1);
      expect(mapper3).toHaveBeenCalledTimes(1);
    });

    it('should handle empty registry gracefully', () => {
      const emptyRegistry = new Map<string, FieldTypeDefinition>();
      const field: FieldDef<any> = { type: 'unknown', key: 'test' };

      const result = mapFieldToBindings(field, emptyRegistry);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
