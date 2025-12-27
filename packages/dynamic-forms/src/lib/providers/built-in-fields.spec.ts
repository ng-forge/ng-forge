import { beforeAll, describe, expect, it } from 'vitest';
import { BUILT_IN_FIELDS } from './built-in-fields';
import { FieldTypeDefinition } from '../models/field-type';
import { arrayFieldMapper, groupFieldMapper, rowFieldMapper, textFieldMapper } from '../mappers';
import { pageFieldMapper } from '../mappers/page/page-field-mapper';

describe('BUILT_IN_FIELDS', () => {
  // Pre-load all components to cache dynamic imports (skip componentless fields)
  beforeAll(async () => {
    const fieldsWithComponents = BUILT_IN_FIELDS.filter((field) => field.loadComponent);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Filter guarantees loadComponent exists
    const loadPromises = fieldsWithComponents.map((field) => field.loadComponent!());
    await Promise.all(loadPromises);
  }, 10000);

  describe('Array structure', () => {
    it('should be an array', () => {
      expect(Array.isArray(BUILT_IN_FIELDS)).toBe(true);
    });

    it('should contain 6 field type definitions', () => {
      expect(BUILT_IN_FIELDS).toHaveLength(6);
    });

    it('should have all required field types', () => {
      const fieldNames = BUILT_IN_FIELDS.map((field) => field.name);

      expect(fieldNames).toContain('row');
      expect(fieldNames).toContain('group');
      expect(fieldNames).toContain('array');
      expect(fieldNames).toContain('page');
      expect(fieldNames).toContain('text');
      expect(fieldNames).toContain('hidden');
    });

    it('should have unique field names', () => {
      const fieldNames = BUILT_IN_FIELDS.map((field) => field.name);
      const uniqueNames = new Set(fieldNames);

      expect(uniqueNames.size).toBe(fieldNames.length);
    });
  });

  describe('Field type definitions', () => {
    it('should have valid FieldTypeDefinition structure for each field', () => {
      BUILT_IN_FIELDS.forEach((field) => {
        expect(field).toHaveProperty('name');
        expect(field).toHaveProperty('valueHandling');
        // loadComponent and mapper are optional for componentless fields
      });
    });

    it('should have string names for all fields', () => {
      BUILT_IN_FIELDS.forEach((field) => {
        expect(typeof field.name).toBe('string');
        expect(field.name.length).toBeGreaterThan(0);
      });
    });

    it('should have function loadComponent for fields with components', () => {
      const fieldsWithComponents = BUILT_IN_FIELDS.filter((f) => f.name !== 'hidden');
      fieldsWithComponents.forEach((field) => {
        expect(typeof field.loadComponent).toBe('function');
      });
    });

    it('should not have loadComponent for componentless fields', () => {
      const hiddenField = BUILT_IN_FIELDS.find((f) => f.name === 'hidden');
      expect(hiddenField?.loadComponent).toBeUndefined();
    });

    it('should have valid value handling strategies', () => {
      const validStrategies = ['flatten', 'include', 'exclude'];

      BUILT_IN_FIELDS.forEach((field) => {
        expect(validStrategies).toContain(field.valueHandling);
      });
    });
  });

  describe('Individual field configurations', () => {
    // Fields with components
    const fieldsWithComponents = [
      { name: 'row', mapper: rowFieldMapper, valueHandling: 'flatten', exportName: 'RowFieldComponent' },
      { name: 'group', mapper: groupFieldMapper, valueHandling: 'include', exportName: 'GroupFieldComponent' },
      { name: 'array', mapper: arrayFieldMapper, valueHandling: 'include', exportName: 'ArrayFieldComponent' },
      { name: 'page', mapper: pageFieldMapper, valueHandling: 'flatten', exportName: 'default' },
      { name: 'text', mapper: textFieldMapper, valueHandling: 'exclude', exportName: 'default' },
    ];

    fieldsWithComponents.forEach(({ name, mapper, valueHandling, exportName }) => {
      describe(name, () => {
        const field = BUILT_IN_FIELDS.find((f) => f.name === name) as FieldTypeDefinition;

        it(`should have correct mapper and value handling`, () => {
          expect(field.name).toBe(name);
          expect(field.mapper).toBe(mapper);
          expect(field.valueHandling).toBe(valueHandling);
        });

        it(`should load component with ${exportName} export`, async () => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- fieldsWithComponents only includes fields with loadComponent
          const module = await field.loadComponent!();

          expect(module).toBeDefined();
          expect(module[exportName]).toBeDefined();
        });
      });
    });

    // Componentless fields
    describe('hidden', () => {
      const field = BUILT_IN_FIELDS.find((f) => f.name === 'hidden') as FieldTypeDefinition;

      it('should have correct value handling', () => {
        expect(field.name).toBe('hidden');
        expect(field.valueHandling).toBe('include');
      });

      it('should not have a loadComponent or mapper (componentless)', () => {
        expect(field.loadComponent).toBeUndefined();
        expect(field.mapper).toBeUndefined();
      });
    });
  });

  describe('Component loading', () => {
    it('should load all components successfully in parallel', async () => {
      const fieldsWithComponents = BUILT_IN_FIELDS.filter((field) => field.loadComponent);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Filter guarantees loadComponent exists
      const loadPromises = fieldsWithComponents.map((field) => field.loadComponent!());
      const modules = await Promise.all(loadPromises);

      expect(modules).toHaveLength(5);
      modules.forEach((module) => {
        expect(module).toBeDefined();
      });
    });
  });
});
