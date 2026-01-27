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
});
