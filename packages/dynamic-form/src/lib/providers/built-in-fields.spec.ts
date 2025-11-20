import { describe, it, expect } from 'vitest';
import { BUILT_IN_FIELDS } from './built-in-fields';
import { FieldTypeDefinition } from '../models/field-type';
import { arrayFieldMapper, baseFieldMapper, groupFieldMapper, rowFieldMapper } from '../mappers';
import { pageFieldMapper } from '../mappers/page/page-field-mapper';

describe('BUILT_IN_FIELDS', () => {
  describe('Array structure', () => {
    it('should be an array', () => {
      expect(Array.isArray(BUILT_IN_FIELDS)).toBe(true);
    });

    it('should contain 5 field type definitions', () => {
      expect(BUILT_IN_FIELDS).toHaveLength(5);
    });

    it('should have all required field types', () => {
      const fieldNames = BUILT_IN_FIELDS.map((field) => field.name);

      expect(fieldNames).toContain('row');
      expect(fieldNames).toContain('group');
      expect(fieldNames).toContain('array');
      expect(fieldNames).toContain('page');
      expect(fieldNames).toContain('text');
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
        expect(field).toHaveProperty('loadComponent');
        expect(field).toHaveProperty('mapper');
        expect(field).toHaveProperty('valueHandling');
      });
    });

    it('should have string names for all fields', () => {
      BUILT_IN_FIELDS.forEach((field) => {
        expect(typeof field.name).toBe('string');
        expect(field.name.length).toBeGreaterThan(0);
      });
    });

    it('should have function loadComponent for all fields', () => {
      BUILT_IN_FIELDS.forEach((field) => {
        expect(typeof field.loadComponent).toBe('function');
      });
    });

    it('should have valid value handling strategies', () => {
      const validStrategies = ['flatten', 'include', 'exclude'];

      BUILT_IN_FIELDS.forEach((field) => {
        expect(validStrategies).toContain(field.valueHandling);
      });
    });
  });

  describe('Row field', () => {
    const rowField = BUILT_IN_FIELDS.find((f) => f.name === 'row') as FieldTypeDefinition;

    it('should have correct name', () => {
      expect(rowField.name).toBe('row');
    });

    it('should use rowFieldMapper', () => {
      expect(rowField.mapper).toBe(rowFieldMapper);
    });

    it('should have flatten value handling', () => {
      expect(rowField.valueHandling).toBe('flatten');
    });

    it('should have loadComponent function', async () => {
      const module = await rowField.loadComponent();

      expect(module).toBeDefined();
      expect(module.RowFieldComponent).toBeDefined();
    });
  });

  describe('Group field', () => {
    const groupField = BUILT_IN_FIELDS.find((f) => f.name === 'group') as FieldTypeDefinition;

    it('should have correct name', () => {
      expect(groupField.name).toBe('group');
    });

    it('should use groupFieldMapper', () => {
      expect(groupField.mapper).toBe(groupFieldMapper);
    });

    it('should have include value handling', () => {
      expect(groupField.valueHandling).toBe('include');
    });

    it('should have loadComponent function', async () => {
      const module = await groupField.loadComponent();

      expect(module).toBeDefined();
      expect(module.GroupFieldComponent).toBeDefined();
    });
  });

  describe('Array field', () => {
    const arrayField = BUILT_IN_FIELDS.find((f) => f.name === 'array') as FieldTypeDefinition;

    it('should have correct name', () => {
      expect(arrayField.name).toBe('array');
    });

    it('should use arrayFieldMapper', () => {
      expect(arrayField.mapper).toBe(arrayFieldMapper);
    });

    it('should have include value handling', () => {
      expect(arrayField.valueHandling).toBe('include');
    });

    it('should have loadComponent function', async () => {
      const module = await arrayField.loadComponent();

      expect(module).toBeDefined();
      expect(module.ArrayFieldComponent).toBeDefined();
    });
  });

  describe('Page field', () => {
    const pageField = BUILT_IN_FIELDS.find((f) => f.name === 'page') as FieldTypeDefinition;

    it('should have correct name', () => {
      expect(pageField.name).toBe('page');
    });

    it('should use pageFieldMapper', () => {
      expect(pageField.mapper).toBe(pageFieldMapper);
    });

    it('should have flatten value handling', () => {
      expect(pageField.valueHandling).toBe('flatten');
    });

    it('should have loadComponent function', async () => {
      const module = await pageField.loadComponent();

      expect(module).toBeDefined();
      expect(module.default).toBeDefined();
    });
  });

  describe('Text field', () => {
    const textField = BUILT_IN_FIELDS.find((f) => f.name === 'text') as FieldTypeDefinition;

    it('should have correct name', () => {
      expect(textField.name).toBe('text');
    });

    it('should use baseFieldMapper', () => {
      expect(textField.mapper).toBe(baseFieldMapper);
    });

    it('should have exclude value handling', () => {
      expect(textField.valueHandling).toBe('exclude');
    });

    it('should have loadComponent function', async () => {
      const module = await textField.loadComponent();

      expect(module).toBeDefined();
      expect(module.default).toBeDefined();
    });
  });

  describe('Value handling strategies', () => {
    it('should use flatten for structural layout fields', () => {
      const flattenFields = BUILT_IN_FIELDS.filter((f) => f.valueHandling === 'flatten');
      const flattenNames = flattenFields.map((f) => f.name);

      expect(flattenNames).toContain('row');
      expect(flattenNames).toContain('page');
    });

    it('should use include for data-containing fields', () => {
      const includeFields = BUILT_IN_FIELDS.filter((f) => f.valueHandling === 'include');
      const includeNames = includeFields.map((f) => f.name);

      expect(includeNames).toContain('group');
      expect(includeNames).toContain('array');
    });

    it('should use exclude for display-only fields', () => {
      const excludeFields = BUILT_IN_FIELDS.filter((f) => f.valueHandling === 'exclude');
      const excludeNames = excludeFields.map((f) => f.name);

      expect(excludeNames).toContain('text');
    });
  });

  describe('Mapper assignments', () => {
    it('should use correct mappers for each field type', () => {
      const mappings: Record<string, unknown> = {
        row: rowFieldMapper,
        group: groupFieldMapper,
        array: arrayFieldMapper,
        page: pageFieldMapper,
        text: baseFieldMapper,
      };

      BUILT_IN_FIELDS.forEach((field) => {
        expect(field.mapper).toBe(mappings[field.name]);
      });
    });

    it('should have function mappers', () => {
      BUILT_IN_FIELDS.forEach((field) => {
        expect(typeof field.mapper).toBe('function');
      });
    });
  });

  describe('Component loading', () => {
    it('should load all components successfully', async () => {
      const loadPromises = BUILT_IN_FIELDS.map((field) => field.loadComponent());
      const modules = await Promise.all(loadPromises);

      expect(modules).toHaveLength(5);
      modules.forEach((module) => {
        expect(module).toBeDefined();
      });
    });

    it('should load components with correct exports', async () => {
      const rowModule = await (BUILT_IN_FIELDS.find((f) => f.name === 'row') as FieldTypeDefinition).loadComponent();
      const groupModule = await (BUILT_IN_FIELDS.find((f) => f.name === 'group') as FieldTypeDefinition).loadComponent();
      const arrayModule = await (BUILT_IN_FIELDS.find((f) => f.name === 'array') as FieldTypeDefinition).loadComponent();
      const pageModule = await (BUILT_IN_FIELDS.find((f) => f.name === 'page') as FieldTypeDefinition).loadComponent();
      const textModule = await (BUILT_IN_FIELDS.find((f) => f.name === 'text') as FieldTypeDefinition).loadComponent();

      expect(rowModule.RowFieldComponent).toBeDefined();
      expect(groupModule.GroupFieldComponent).toBeDefined();
      expect(arrayModule.ArrayFieldComponent).toBeDefined();
      expect(pageModule.default).toBeDefined();
      expect(textModule.default).toBeDefined();
    });
  });

  describe('Type safety', () => {
    it('should be typed as FieldTypeDefinition array', () => {
      const fields: FieldTypeDefinition[] = BUILT_IN_FIELDS;

      expect(fields).toBe(BUILT_IN_FIELDS);
    });

    it('should maintain field order', () => {
      const expectedOrder = ['row', 'group', 'array', 'page', 'text'];
      const actualOrder = BUILT_IN_FIELDS.map((f) => f.name);

      expect(actualOrder).toEqual(expectedOrder);
    });
  });
});
