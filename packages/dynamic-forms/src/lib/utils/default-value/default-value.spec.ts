import { describe, it, expect } from 'vitest';
import { getFieldDefaultValue } from './default-value';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';

describe('getFieldDefaultValue', () => {
  let registry: Map<string, FieldTypeDefinition>;

  beforeEach(() => {
    // Setup a basic registry with common field types
    registry = new Map<string, FieldTypeDefinition>([
      ['input', { component: {} as any, valueHandling: 'include' }],
      ['checkbox', { component: {} as any, valueHandling: 'include' }],
      ['select', { component: {} as any, valueHandling: 'include' }],
      ['array', { component: {} as any, valueHandling: 'include' }],
      ['group', { component: {} as any, valueHandling: 'include' }],
      ['text', { component: {} as any, valueHandling: 'exclude' }],
      ['button', { component: {} as any, valueHandling: 'exclude' }],
      ['row', { component: {} as any, valueHandling: 'flatten' }],
      ['page', { component: {} as any, valueHandling: 'flatten' }],
    ]);
  });

  describe('basic field types', () => {
    it('should return empty string for input field', () => {
      const field: FieldDef<any> = { type: 'input', key: 'email' };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBe('');
    });

    it('should return false for checkbox field', () => {
      const field: FieldDef<any> = { type: 'checkbox', key: 'agree' };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBe(false);
    });

    it('should return empty array for array field', () => {
      const field: FieldDef<any> = { type: 'array', key: 'items' };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual([]);
    });

    it('should return empty string for select field', () => {
      const field: FieldDef<any> = { type: 'select', key: 'country' };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBe('');
    });
  });

  describe('exclude value handling', () => {
    it('should return undefined for excluded field types (text)', () => {
      const field: FieldDef<any> = { type: 'text', key: 'label' };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBeUndefined();
    });

    it('should return undefined for excluded field types (button)', () => {
      const field: FieldDef<any> = { type: 'button', key: 'submit' };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBeUndefined();
    });
  });

  describe('flatten value handling', () => {
    it('should flatten row field with single value child', () => {
      const field: FieldDef<any> = {
        type: 'row',
        key: 'rowKey',
        fields: [{ type: 'input', key: 'name' }],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual({ name: '' });
    });

    it('should flatten row field with multiple value children', () => {
      const field: FieldDef<any> = {
        type: 'row',
        key: 'rowKey',
        fields: [
          { type: 'input', key: 'firstName' },
          { type: 'input', key: 'lastName' },
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual({ firstName: '', lastName: '' });
    });

    it('should flatten page field with children', () => {
      const field: FieldDef<any> = {
        type: 'page',
        key: 'pageKey',
        fields: [
          { type: 'input', key: 'email' },
          { type: 'checkbox', key: 'subscribe' },
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual({ email: '', subscribe: false });
    });

    it('should exclude non-value fields when flattening', () => {
      const field: FieldDef<any> = {
        type: 'row',
        key: 'rowKey',
        fields: [
          { type: 'text', key: 'label' },
          { type: 'input', key: 'name' },
          { type: 'button', key: 'submit' },
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual({ name: '' });
    });

    it('should return undefined for flatten field with no value children', () => {
      const field: FieldDef<any> = {
        type: 'row',
        key: 'rowKey',
        fields: [
          { type: 'text', key: 'label' },
          { type: 'button', key: 'submit' },
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBeUndefined();
    });

    it('should return undefined for flatten field with no fields', () => {
      const field: FieldDef<any> = {
        type: 'row',
        key: 'rowKey',
        fields: [],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBeUndefined();
    });
  });

  describe('group fields', () => {
    it('should create nested object for group field', () => {
      const field: FieldDef<any> = {
        type: 'group',
        key: 'address',
        fields: [
          { type: 'input', key: 'street' },
          { type: 'input', key: 'city' },
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual({ street: '', city: '' });
    });

    it('should handle group with mixed field types', () => {
      const field: FieldDef<any> = {
        type: 'group',
        key: 'profile',
        fields: [
          { type: 'input', key: 'name' },
          { type: 'checkbox', key: 'active' },
          { type: 'select', key: 'role' },
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual({ name: '', active: false, role: '' });
    });

    it('should exclude non-value fields in group', () => {
      const field: FieldDef<any> = {
        type: 'group',
        key: 'formGroup',
        fields: [
          { type: 'text', key: 'heading' },
          { type: 'input', key: 'value' },
          { type: 'button', key: 'save' },
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual({ value: '' });
    });

    it('should return undefined for empty group', () => {
      const field: FieldDef<any> = {
        type: 'group',
        key: 'emptyGroup',
        fields: [],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBeUndefined();
    });

    it('should handle nested groups', () => {
      const field: FieldDef<any> = {
        type: 'group',
        key: 'user',
        fields: [
          { type: 'input', key: 'name' },
          {
            type: 'group',
            key: 'address',
            fields: [
              { type: 'input', key: 'street' },
              { type: 'input', key: 'city' },
            ],
          },
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual({
        name: '',
        address: { street: '', city: '' },
      });
    });
  });

  describe('value property', () => {
    it('should use value when provided', () => {
      const field: FieldDef<any> = {
        type: 'input',
        key: 'email',
        value: 'test@example.com',
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBe('test@example.com');
    });

    it('should handle explicit null value for input (return empty string)', () => {
      const field: FieldDef<any> = {
        type: 'input',
        key: 'name',
        value: null,
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBe('');
    });

    it('should handle explicit null value for checkbox (return false)', () => {
      const field: FieldDef<any> = {
        type: 'checkbox',
        key: 'agree',
        value: null,
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBe(false);
    });

    it('should handle explicit undefined value (fall through to type default)', () => {
      const field: FieldDef<any> = {
        type: 'input',
        key: 'name',
        value: undefined,
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBe('');
    });

    it('should use value for checkbox true', () => {
      const field: FieldDef<any> = {
        type: 'checkbox',
        key: 'active',
        value: true,
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBe(true);
    });

    it('should use value for checkbox false', () => {
      const field: FieldDef<any> = {
        type: 'checkbox',
        key: 'inactive',
        value: false,
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBe(false);
    });
  });

  describe('primitive array items', () => {
    it('should extract field values directly for primitive array items (single field, not wrapped in array)', () => {
      const field: FieldDef<any> = {
        type: 'array',
        key: 'tags',
        fields: [
          { type: 'input', key: 'tag', value: 'angular' },
          { type: 'input', key: 'tag', value: 'typescript' },
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      // Primitive items: extract field value directly
      expect(result).toEqual(['angular', 'typescript']);
    });

    it('should handle primitive array items with default values', () => {
      const field: FieldDef<any> = {
        type: 'array',
        key: 'tags',
        fields: [
          { type: 'input', key: 'tag' }, // No value - defaults to ''
          { type: 'checkbox', key: 'flag' }, // No value - defaults to false
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual(['', false]);
    });

    it('should handle object array items (array of fields)', () => {
      const field: FieldDef<any> = {
        type: 'array',
        key: 'contacts',
        fields: [
          [
            { type: 'input', key: 'name', value: 'Alice' },
            { type: 'input', key: 'email', value: 'alice@example.com' },
          ],
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      // Object items: merge fields into object
      expect(result).toEqual([{ name: 'Alice', email: 'alice@example.com' }]);
    });

    it('should handle heterogeneous array items (mixed primitive and object)', () => {
      const field: FieldDef<any> = {
        type: 'array',
        key: 'items',
        fields: [
          [{ type: 'input', key: 'label', value: 'Structured' }], // Object item
          { type: 'input', key: 'value', value: 'Simple' }, // Primitive item
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual([{ label: 'Structured' }, 'Simple']);
    });

    it('should handle empty array', () => {
      const field: FieldDef<any> = {
        type: 'array',
        key: 'empty',
        fields: [],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle field without key in group', () => {
      const field: FieldDef<any> = {
        type: 'group',
        key: 'test',
        fields: [
          { type: 'input', key: 'name' },
          { type: 'text' } as any, // Field without key
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual({ name: '' });
    });

    it('should handle unregistered field type (defaults to empty string)', () => {
      const field: FieldDef<any> = {
        type: 'unknown' as any,
        key: 'test',
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toBe('');
    });

    it('should handle group with all excluded children', () => {
      const field: FieldDef<any> = {
        type: 'group',
        key: 'test',
        fields: [
          { type: 'text', key: 'label' },
          { type: 'button', key: 'submit' },
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual({});
    });

    it('should handle complex nested structure', () => {
      const field: FieldDef<any> = {
        type: 'group',
        key: 'user',
        fields: [
          { type: 'input', key: 'name', value: 'John' },
          {
            type: 'row',
            key: 'row1',
            fields: [
              { type: 'input', key: 'email' },
              { type: 'checkbox', key: 'verified', value: true },
            ],
          },
          {
            type: 'group',
            key: 'settings',
            fields: [{ type: 'select', key: 'theme', value: 'dark' }],
          },
        ],
      };
      const result = getFieldDefaultValue(field, registry);

      expect(result).toEqual({
        name: 'John',
        email: '',
        verified: true,
        settings: { theme: 'dark' },
      });
    });
  });
});
