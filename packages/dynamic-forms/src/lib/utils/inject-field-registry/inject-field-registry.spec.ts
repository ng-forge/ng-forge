import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component, signal, Type } from '@angular/core';
import { injectFieldRegistry } from './inject-field-registry';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../../models/field-type';

@Component({ standalone: true, template: '' })
class TestComponent {}

@Component({ standalone: true, template: '' })
class AnotherComponent {}

describe('injectFieldRegistry', () => {
  let registry: Map<string, FieldTypeDefinition>;
  let fieldRegistry: ReturnType<typeof injectFieldRegistry>;

  beforeEach(() => {
    registry = new Map<string, FieldTypeDefinition>();

    TestBed.configureTestingModule({
      providers: [{ provide: FIELD_REGISTRY, useValue: registry }],
    });

    TestBed.runInInjectionContext(() => {
      fieldRegistry = injectFieldRegistry();
    });
  });

  describe('getType', () => {
    it('should return field type definition if it exists', () => {
      const inputType: FieldTypeDefinition = {
        name: 'input',
        component: TestComponent,
      };

      registry.set('input', inputType);

      const result = fieldRegistry.getType('input');

      expect(result).toBe(inputType);
    });

    it('should return undefined if field type does not exist', () => {
      const result = fieldRegistry.getType('nonexistent');

      expect(result).toBeUndefined();
    });

    it('should return correct type for multiple registered types', () => {
      const inputType: FieldTypeDefinition = { name: 'input', component: TestComponent };
      const checkboxType: FieldTypeDefinition = { name: 'checkbox', component: AnotherComponent };

      registry.set('input', inputType);
      registry.set('checkbox', checkboxType);

      expect(fieldRegistry.getType('input')).toBe(inputType);
      expect(fieldRegistry.getType('checkbox')).toBe(checkboxType);
    });
  });

  describe('hasType', () => {
    it('should return true if field type exists', () => {
      registry.set('input', { name: 'input', component: TestComponent });

      const result = fieldRegistry.hasType('input');

      expect(result).toBe(true);
    });

    it('should return false if field type does not exist', () => {
      const result = fieldRegistry.hasType('nonexistent');

      expect(result).toBe(false);
    });

    it('should work with multiple field types', () => {
      registry.set('input', { name: 'input', component: TestComponent });
      registry.set('checkbox', { name: 'checkbox', component: AnotherComponent });

      expect(fieldRegistry.hasType('input')).toBe(true);
      expect(fieldRegistry.hasType('checkbox')).toBe(true);
      expect(fieldRegistry.hasType('select')).toBe(false);
    });
  });

  describe('loadTypeComponent', () => {
    it('should load component using loadComponent function', async () => {
      const loadComponentFn = async () => TestComponent;

      registry.set('input', {
        name: 'input',
        loadComponent: loadComponentFn,
      });

      const result = await fieldRegistry.loadTypeComponent('input');

      expect(result).toBe(TestComponent);
    });

    it('should handle ES module default exports', async () => {
      const loadComponentFn = async () => ({ default: TestComponent }) as any;

      registry.set('input', {
        name: 'input',
        loadComponent: loadComponentFn,
      });

      const result = await fieldRegistry.loadTypeComponent('input');

      expect(result).toBe(TestComponent);
    });

    it('should throw error if field type is not registered', async () => {
      await expect(fieldRegistry.loadTypeComponent('nonexistent')).rejects.toThrow('Field type "nonexistent" is not registered');
    });

    it('should return undefined for componentless field types', async () => {
      // Componentless fields (like hidden) only have a mapper, no component
      registry.set('hidden', {
        name: 'hidden',
        mapper: () => ({ value: signal({}) }),
        valueHandling: 'include',
      });

      const result = await fieldRegistry.loadTypeComponent('hidden');

      expect(result).toBeUndefined();
    });

    it('should throw error if loadComponent fails', async () => {
      const loadComponentFn = async () => {
        throw new Error('Load failed');
      };

      registry.set('input', {
        name: 'input',
        loadComponent: loadComponentFn,
      });

      await expect(fieldRegistry.loadTypeComponent('input')).rejects.toThrow('Failed to load component for field type "input"');
    });

    it('should handle multiple async loads', async () => {
      registry.set('input', {
        name: 'input',
        loadComponent: async () => TestComponent,
      });

      registry.set('checkbox', {
        name: 'checkbox',
        loadComponent: async () => AnotherComponent,
      });

      const [inputComp, checkboxComp] = await Promise.all([
        fieldRegistry.loadTypeComponent('input'),
        fieldRegistry.loadTypeComponent('checkbox'),
      ]);

      expect(inputComp).toBe(TestComponent);
      expect(checkboxComp).toBe(AnotherComponent);
    });
  });

  describe('getTypes', () => {
    it('should return empty array when registry is empty', () => {
      const result = fieldRegistry.getTypes();

      expect(result).toEqual([]);
    });

    it('should return all registered field types', () => {
      const inputType: FieldTypeDefinition = { name: 'input', component: TestComponent };
      const checkboxType: FieldTypeDefinition = { name: 'checkbox', component: AnotherComponent };

      registry.set('input', inputType);
      registry.set('checkbox', checkboxType);

      const result = fieldRegistry.getTypes();

      expect(result).toHaveLength(2);
      expect(result).toContain(inputType);
      expect(result).toContain(checkboxType);
    });

    it('should return array with all field type properties', () => {
      const fieldType: FieldTypeDefinition = {
        name: 'custom',
        component: TestComponent,
        valueHandling: 'include',
        mapper: () => [],
      };

      registry.set('custom', fieldType);

      const result = fieldRegistry.getTypes();

      expect(result[0]).toEqual(fieldType);
      expect(result[0].name).toBe('custom');
      expect(result[0].component).toBe(TestComponent);
      expect(result[0].valueHandling).toBe('include');
    });
  });

  describe('registerTypes', () => {
    it('should register single field type', () => {
      const inputType: FieldTypeDefinition = { name: 'input', component: TestComponent };

      fieldRegistry.registerTypes([inputType]);

      expect(registry.has('input')).toBe(true);
      expect(registry.get('input')).toBe(inputType);
    });

    it('should register multiple field types', () => {
      const types: FieldTypeDefinition[] = [
        { name: 'input', component: TestComponent },
        { name: 'checkbox', component: AnotherComponent },
        { name: 'select', component: TestComponent },
      ];

      fieldRegistry.registerTypes(types);

      expect(registry.size).toBe(3);
      expect(registry.has('input')).toBe(true);
      expect(registry.has('checkbox')).toBe(true);
      expect(registry.has('select')).toBe(true);
    });

    it('should overwrite existing registration', () => {
      const oldType: FieldTypeDefinition = { name: 'input', component: TestComponent };
      const newType: FieldTypeDefinition = { name: 'input', component: AnotherComponent };

      registry.set('input', oldType);
      fieldRegistry.registerTypes([newType]);

      expect(registry.get('input')).toBe(newType);
      expect(registry.get('input')?.component).toBe(AnotherComponent);
    });

    it('should handle empty array', () => {
      fieldRegistry.registerTypes([]);

      expect(registry.size).toBe(0);
    });

    it('should preserve existing types when registering new ones', () => {
      const existingType: FieldTypeDefinition = { name: 'existing', component: TestComponent };
      registry.set('existing', existingType);

      const newType: FieldTypeDefinition = { name: 'new', component: AnotherComponent };
      fieldRegistry.registerTypes([newType]);

      expect(registry.size).toBe(2);
      expect(registry.has('existing')).toBe(true);
      expect(registry.has('new')).toBe(true);
    });
  });

  describe('raw property', () => {
    it('should return the underlying registry Map', () => {
      const result = fieldRegistry.raw;

      expect(result).toBe(registry);
    });

    it('should allow direct access to Map methods', () => {
      const fieldType: FieldTypeDefinition = { name: 'test', component: TestComponent };
      registry.set('test', fieldType);

      const rawRegistry = fieldRegistry.raw;

      expect(rawRegistry.size).toBe(1);
      expect(rawRegistry.has('test')).toBe(true);
      expect(rawRegistry.get('test')).toBe(fieldType);
    });

    it('should allow direct modification of registry', () => {
      const rawRegistry = fieldRegistry.raw;
      const newType: FieldTypeDefinition = { name: 'custom', component: TestComponent };

      rawRegistry.set('custom', newType);

      expect(fieldRegistry.hasType('custom')).toBe(true);
      expect(fieldRegistry.getType('custom')).toBe(newType);
    });
  });

  describe('integration scenarios', () => {
    it('should work with full field type registration workflow', () => {
      const customType: FieldTypeDefinition = {
        name: 'custom-input',
        component: TestComponent,
        valueHandling: 'include',
        mapper: () => [],
      };

      // Register
      fieldRegistry.registerTypes([customType]);

      // Check registration
      expect(fieldRegistry.hasType('custom-input')).toBe(true);

      // Retrieve
      const retrieved = fieldRegistry.getType('custom-input');
      expect(retrieved).toBe(customType);

      // List all
      const allTypes = fieldRegistry.getTypes();
      expect(allTypes).toContain(customType);
    });

    it('should support lazy loading workflow', async () => {
      const asyncType: FieldTypeDefinition = {
        name: 'async-field',
        loadComponent: async () => {
          // Simulate async import
          return new Promise<Type<unknown>>((resolve) => {
            setTimeout(() => resolve(TestComponent), 10);
          });
        },
      };

      fieldRegistry.registerTypes([asyncType]);

      expect(fieldRegistry.hasType('async-field')).toBe(true);

      const component = await fieldRegistry.loadTypeComponent('async-field');
      expect(component).toBe(TestComponent);
    });
  });
});
