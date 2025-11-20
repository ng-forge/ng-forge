import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapFieldToBindings } from './field-mapper';
import { FieldDef } from '../../definitions/base';
import { FieldTypeDefinition } from '../../models/field-type';
import { Binding } from '@angular/core';
import * as mappers from '../../mappers';

describe('mapFieldToBindings', () => {
  let registry: Map<string, FieldTypeDefinition>;
  let baseMapperSpy: any;

  beforeEach(() => {
    // Spy on the base mapper
    baseMapperSpy = vi.spyOn(mappers, 'baseFieldMapper');
    baseMapperSpy.mockReturnValue([{ provide: 'test', useValue: 'base' }] as Binding[]);

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
      expect(baseMapperSpy).not.toHaveBeenCalled();
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
        options: ['USA', 'Canada'],
      };

      mapFieldToBindings(field, registry);

      expect(customMapper).toHaveBeenCalledWith(field);
      expect(customMapper).toHaveBeenCalledTimes(1);
    });

    it('should work with different custom mappers for different field types', () => {
      const inputMapper = vi.fn().mockReturnValue([{ provide: 'input', useValue: 'input-binding' }] as Binding[]);
      const checkboxMapper = vi.fn().mockReturnValue([{ provide: 'checkbox', useValue: 'checkbox-binding' }] as Binding[]);

      registry.set('input', { component: {} as any, mapper: inputMapper });
      registry.set('checkbox', { component: {} as any, mapper: checkboxMapper });

      const inputField: FieldDef<any> = { type: 'input', key: 'name' };
      const checkboxField: FieldDef<any> = { type: 'checkbox', key: 'agree' };

      const inputResult = mapFieldToBindings(inputField, registry);
      const checkboxResult = mapFieldToBindings(checkboxField, registry);

      expect(inputMapper).toHaveBeenCalledWith(inputField);
      expect(checkboxMapper).toHaveBeenCalledWith(checkboxField);
      expect(inputResult).toEqual([{ provide: 'input', useValue: 'input-binding' }]);
      expect(checkboxResult).toEqual([{ provide: 'checkbox', useValue: 'checkbox-binding' }]);
    });
  });

  describe('base mapper fallback', () => {
    it('should use base mapper when field type is not in registry', () => {
      const field: FieldDef<any> = { type: 'unknown', key: 'test' };
      const result = mapFieldToBindings(field, registry);

      expect(baseMapperSpy).toHaveBeenCalledWith(field);
      expect(result).toEqual([{ provide: 'test', useValue: 'base' }]);
    });

    it('should use base mapper when field type definition has no mapper', () => {
      registry.set('input', {
        component: {} as any,
        // No mapper property
      });

      const field: FieldDef<any> = { type: 'input', key: 'email' };
      const result = mapFieldToBindings(field, registry);

      expect(baseMapperSpy).toHaveBeenCalledWith(field);
      expect(result).toEqual([{ provide: 'test', useValue: 'base' }]);
    });

    it('should use base mapper when field type definition mapper is undefined', () => {
      registry.set('select', {
        component: {} as any,
        mapper: undefined,
      });

      const field: FieldDef<any> = { type: 'select', key: 'country' };
      const result = mapFieldToBindings(field, registry);

      expect(baseMapperSpy).toHaveBeenCalledWith(field);
      expect(result).toEqual([{ provide: 'test', useValue: 'base' }]);
    });

    it('should pass field definition to base mapper', () => {
      const field: FieldDef<any> = {
        type: 'textarea',
        key: 'description',
        label: 'Description',
        rows: 5,
      };

      mapFieldToBindings(field, registry);

      expect(baseMapperSpy).toHaveBeenCalledWith(field);
    });
  });

  describe('edge cases', () => {
    it('should handle empty registry', () => {
      const emptyRegistry = new Map<string, FieldTypeDefinition>();
      const field: FieldDef<any> = { type: 'input', key: 'test' };

      const result = mapFieldToBindings(field, emptyRegistry);

      expect(baseMapperSpy).toHaveBeenCalledWith(field);
      expect(result).toEqual([{ provide: 'test', useValue: 'base' }]);
    });

    it('should handle field with complex definition', () => {
      const customMapper = vi.fn().mockReturnValue([{ provide: 'complex', useValue: 'result' }] as Binding[]);

      registry.set('group', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = {
        type: 'group',
        key: 'address',
        label: 'Address',
        fields: [
          { type: 'input', key: 'street' },
          { type: 'input', key: 'city' },
        ],
      };

      const result = mapFieldToBindings(field, registry);

      expect(customMapper).toHaveBeenCalledWith(field);
      expect(result).toEqual([{ provide: 'complex', useValue: 'result' }]);
    });

    it('should handle multiple calls with same field type', () => {
      const customMapper = vi.fn().mockReturnValue([{ provide: 'test', useValue: 'value' }] as Binding[]);

      registry.set('input', { component: {} as any, mapper: customMapper });

      const field1: FieldDef<any> = { type: 'input', key: 'email' };
      const field2: FieldDef<any> = { type: 'input', key: 'name' };

      mapFieldToBindings(field1, registry);
      mapFieldToBindings(field2, registry);

      expect(customMapper).toHaveBeenCalledTimes(2);
      expect(customMapper).toHaveBeenCalledWith(field1);
      expect(customMapper).toHaveBeenCalledWith(field2);
    });

    it('should handle mapper that returns empty bindings array', () => {
      const emptyMapper = vi.fn().mockReturnValue([] as Binding[]);

      registry.set('button', { component: {} as any, mapper: emptyMapper });

      const field: FieldDef<any> = { type: 'button', key: 'submit' };
      const result = mapFieldToBindings(field, registry);

      expect(emptyMapper).toHaveBeenCalledWith(field);
      expect(result).toEqual([]);
    });
  });

  describe('registry updates', () => {
    it('should use updated mapper after registry modification', () => {
      const mapper1 = vi.fn().mockReturnValue([{ provide: 'v1', useValue: 'value1' }] as Binding[]);
      const mapper2 = vi.fn().mockReturnValue([{ provide: 'v2', useValue: 'value2' }] as Binding[]);

      const field: FieldDef<any> = { type: 'input', key: 'test' };

      // First mapper
      registry.set('input', { component: {} as any, mapper: mapper1 });
      const result1 = mapFieldToBindings(field, registry);

      // Update mapper
      registry.set('input', { component: {} as any, mapper: mapper2 });
      const result2 = mapFieldToBindings(field, registry);

      expect(mapper1).toHaveBeenCalledTimes(1);
      expect(mapper2).toHaveBeenCalledTimes(1);
      expect(result1).toEqual([{ provide: 'v1', useValue: 'value1' }]);
      expect(result2).toEqual([{ provide: 'v2', useValue: 'value2' }]);
    });

    it('should fall back to base mapper after removing field type from registry', () => {
      const customMapper = vi.fn().mockReturnValue([{ provide: 'custom', useValue: 'value' }] as Binding[]);

      const field: FieldDef<any> = { type: 'input', key: 'test' };

      // With custom mapper
      registry.set('input', { component: {} as any, mapper: customMapper });
      mapFieldToBindings(field, registry);

      // Remove from registry
      registry.delete('input');
      mapFieldToBindings(field, registry);

      expect(customMapper).toHaveBeenCalledTimes(1);
      expect(baseMapperSpy).toHaveBeenCalledTimes(1);
    });
  });
});
