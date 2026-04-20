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
  getWrappers,
  getWrapper,
  getWrappersByCategory,
  WRAPPER_AUTHORING_CONTRACT,
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

  describe('Wrappers', () => {
    it('should return all wrappers', () => {
      const wrappers = getWrappers();
      expect(wrappers).toBeDefined();
      expect(Array.isArray(wrappers)).toBe(true);
      expect(wrappers.length).toBeGreaterThan(0);
    });

    it('should include the built-in css wrapper', () => {
      const css = getWrapper('css');
      expect(css).toBeDefined();
      expect(css?.type).toBe('css');
      expect(css?.category).toBe('core');
      expect(css?.availability).toBe('shipping');
      expect(css?.package).toBe('@ng-forge/dynamic-forms');
      expect(css?.props.cssClasses).toBeDefined();
    });

    it('should include the demo arraySection wrapper', () => {
      const arraySection = getWrapper('arraySection');
      expect(arraySection).toBeDefined();
      expect(arraySection?.category).toBe('demo');
      expect(arraySection?.availability).toBe('demo-only');
      expect(arraySection?.package).toBe('@internal/examples-shared-ui');
      expect(arraySection?.props.itemTemplate).toBeDefined();
      expect(arraySection?.props.itemTemplate.required).toBe(true);
    });

    it('should include the demo section wrapper', () => {
      const section = getWrapper('section');
      expect(section).toBeDefined();
      expect(section?.category).toBe('demo');
      expect(section?.availability).toBe('demo-only');
      expect(section?.props.title).toBeDefined();
      expect(section?.props.title.required).toBe(false);
    });

    it('should return undefined for unknown wrapper', () => {
      expect(getWrapper('nonexistent-wrapper')).toBeUndefined();
    });

    it('should filter wrappers by category', () => {
      const core = getWrappersByCategory('core');
      expect(core.every((w) => w.category === 'core')).toBe(true);
      expect(core.some((w) => w.type === 'css')).toBe(true);

      const demo = getWrappersByCategory('demo');
      expect(demo.every((w) => w.category === 'demo')).toBe(true);
      expect(demo.some((w) => w.type === 'section')).toBe(true);
      expect(demo.some((w) => w.type === 'arraySection')).toBe(true);
    });

    it('exposes the shared authoring contract string', () => {
      expect(WRAPPER_AUTHORING_CONTRACT).toBeTruthy();
      expect(WRAPPER_AUTHORING_CONTRACT).toContain('FieldWrapperContract');
      expect(WRAPPER_AUTHORING_CONTRACT).toContain("viewChild.required('fieldComponent'");
      expect(WRAPPER_AUTHORING_CONTRACT).toContain('@if');
      expect(WRAPPER_AUTHORING_CONTRACT).toContain('@defer');
      expect(WRAPPER_AUTHORING_CONTRACT).toContain('@for');
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

    describe('Wrapper completeness', () => {
      it('every wrapper entry has the required properties', () => {
        const wrappers = getWrappers();

        for (const w of wrappers) {
          expect(w.type, `wrapper missing 'type'`).toBeTruthy();
          expect(w.category, `${w.type} missing 'category'`).toBeTruthy();
          expect(w.availability, `${w.type} missing 'availability'`).toBeTruthy();
          expect(w.package, `${w.type} missing 'package'`).toBeTruthy();
          expect(w.description, `${w.type} missing 'description'`).toBeTruthy();
          expect(w.componentName, `${w.type} missing 'componentName'`).toBeTruthy();
          expect(w.example, `${w.type} missing 'example'`).toBeTruthy();
          expect(w.contract, `${w.type} missing 'contract'`).toBeTruthy();
          expect(['core', 'demo', 'adapter']).toContain(w.category);
          expect(['shipping', 'demo-only']).toContain(w.availability);
          expect(Array.isArray(w.autoAppliesTo)).toBe(true);
        }
      });

      it('no duplicate wrapper entries', () => {
        const wrappers = getWrappers();
        const types = wrappers.map((w) => w.type);
        const unique = new Set(types);

        expect(types.length).toBe(unique.size);
      });

      it('demo-only wrappers ship from @internal/examples-shared-ui', () => {
        const demoOnly = getWrappers().filter((w) => w.availability === 'demo-only');
        expect(demoOnly.length).toBeGreaterThan(0);
        for (const w of demoOnly) {
          expect(w.package, `${w.type} should be sourced from examples-shared-ui`).toBe('@internal/examples-shared-ui');
          expect(w.category, `${w.type} should have category 'demo'`).toBe('demo');
        }
      });

      it('every wrapper shares the canonical authoring contract', () => {
        for (const w of getWrappers()) {
          expect(w.contract, `${w.type} should reference the shared authoring contract`).toBe(WRAPPER_AUTHORING_CONTRACT);
        }
      });

      it('every wrapper prop entry has required fields', () => {
        for (const w of getWrappers()) {
          for (const prop of Object.values(w.props)) {
            expect(prop.name, `${w.type}.${prop.name} missing 'name'`).toBeTruthy();
            expect(prop.type, `${w.type}.${prop.name} missing 'type'`).toBeTruthy();
            expect(prop.description, `${w.type}.${prop.name} missing 'description'`).toBeTruthy();
            expect(typeof prop.required).toBe('boolean');
          }
        }
      });
    });
  });
});
