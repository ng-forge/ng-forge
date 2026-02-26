/**
 * Registry Tests
 *
 * Tests for the registry module that loads and exports field types, validators, and UI adapters.
 */

import { describe, it, expect } from 'vitest';
import {
  getFieldTypes,
  getFieldType,
  getFieldTypesByCategory,
  getValidators,
  getValidator,
  getValidatorsByCategory,
  getUIAdapters,
  getUIAdapter,
  getUIAdapterFieldType,
} from './index.js';

describe('Registry', () => {
  describe('Field Types', () => {
    it('should return all field types', () => {
      const fieldTypes = getFieldTypes();
      expect(fieldTypes).toBeDefined();
      expect(Array.isArray(fieldTypes)).toBe(true);
      expect(fieldTypes.length).toBeGreaterThan(0);
    });

    it('should get a specific field type', () => {
      const input = getFieldType('input');
      expect(input).toBeDefined();
      expect(input?.type).toBe('input');
      expect(input?.category).toBe('value');
    });

    it('should return undefined for unknown field type', () => {
      const unknown = getFieldType('nonexistent');
      expect(unknown).toBeUndefined();
    });

    it('should get field types by category', () => {
      const valueFields = getFieldTypesByCategory('value');
      expect(valueFields).toBeDefined();
      expect(Array.isArray(valueFields)).toBe(true);
      expect(valueFields.every((f) => f.category === 'value')).toBe(true);
    });
  });

  describe('Validators', () => {
    it('should return all validators', () => {
      const validators = getValidators();
      expect(validators).toBeDefined();
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThan(0);
    });

    it('should get a specific validator', () => {
      const required = getValidator('required');
      expect(required).toBeDefined();
      expect(required?.type).toBe('required');
    });

    it('should return undefined for unknown validator', () => {
      const unknown = getValidator('nonexistent');
      expect(unknown).toBeUndefined();
    });

    it('should get validators by category', () => {
      const builtIn = getValidatorsByCategory('built-in');
      expect(builtIn).toBeDefined();
      expect(Array.isArray(builtIn)).toBe(true);
      expect(builtIn.every((v) => v.category === 'built-in')).toBe(true);
    });
  });

  describe('UI Adapters', () => {
    it('should return all UI adapters', () => {
      const adapters = getUIAdapters();
      expect(adapters).toBeDefined();
      expect(Array.isArray(adapters)).toBe(true);
      expect(adapters.length).toBe(4); // material, bootstrap, primeng, ionic
    });

    it('should get a specific UI adapter', () => {
      const material = getUIAdapter('material');
      expect(material).toBeDefined();
      expect(material?.library).toBe('material');
      expect(material?.package).toBe('@ng-forge/dynamic-forms-material');
    });

    it('should return undefined for unknown UI adapter', () => {
      const unknown = getUIAdapter('nonexistent' as 'material');
      expect(unknown).toBeUndefined();
    });

    it('should get a specific field type from a UI adapter', () => {
      const inputField = getUIAdapterFieldType('material', 'input');
      expect(inputField).toBeDefined();
      expect(inputField?.type).toBe('input');
      expect(inputField?.componentName).toBe('MatInputFieldComponent');
    });

    it('should return undefined for unknown field type in UI adapter', () => {
      const unknown = getUIAdapterFieldType('material', 'nonexistent');
      expect(unknown).toBeUndefined();
    });
  });

  describe('Staleness Guard', () => {
    describe('Field type completeness', () => {
      it('every field type entry has required properties', () => {
        const fieldTypes = getFieldTypes();

        for (const ft of fieldTypes) {
          expect(ft.type, `field type missing 'type'`).toBeTruthy();
          expect(ft.category, `${ft.type} missing 'category'`).toBeTruthy();
          expect(ft.description, `${ft.type} missing 'description'`).toBeTruthy();
          expect(ft.example, `${ft.type} missing 'example'`).toBeTruthy();
          expect(['value', 'container', 'button', 'display']).toContain(ft.category);
        }
      });

      it('no duplicate field type entries', () => {
        const fieldTypes = getFieldTypes();
        const types = fieldTypes.map((ft) => ft.type);
        const unique = new Set(types);

        expect(types.length).toBe(unique.size);
      });

      it('registry covers all Zod-schema-supported field types', () => {
        const schemaSupportedTypes = [
          'input',
          'textarea',
          'select',
          'checkbox',
          'radio',
          'multi-checkbox',
          'toggle',
          'slider',
          'datepicker',
          'button',
          'submit',
          'next',
          'previous',
        ];

        const registryTypes = new Set(getFieldTypes().map((ft) => ft.type));

        for (const schemaType of schemaSupportedTypes) {
          expect(registryTypes.has(schemaType), `registry missing Zod-supported type '${schemaType}'`).toBe(true);
        }
      });
    });

    describe('Validator completeness', () => {
      it('every validator entry has required properties', () => {
        const validators = getValidators();

        for (const v of validators) {
          expect(v.type, `validator missing 'type'`).toBeTruthy();
          expect(v.category, `${v.type} missing 'category'`).toBeTruthy();
          expect(v.description, `${v.type} missing 'description'`).toBeTruthy();
          expect(v.example, `${v.type} missing 'example'`).toBeTruthy();
          expect(['built-in', 'custom', 'async', 'http']).toContain(v.category);
        }
      });

      it('no duplicate validator entries', () => {
        const validators = getValidators();
        const types = validators.map((v) => v.type);
        const unique = new Set(types);

        expect(types.length).toBe(unique.size);
      });
    });

    describe('UI adapter consistency', () => {
      it('each UI adapter references only valid field types from registry', () => {
        const registryTypes = new Set(getFieldTypes().map((ft) => ft.type));
        const adapters = getUIAdapters();

        for (const adapter of adapters) {
          for (const ft of adapter.fieldTypes) {
            expect(registryTypes.has(ft.type), `${adapter.library} adapter references unknown type '${ft.type}'`).toBe(true);
          }
        }
      });
    });
  });
});
