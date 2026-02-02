import { describe, it, expect } from 'vitest';
import {
  extractSuffixFromUuid,
  addKeySuffixToField,
  addKeySuffixToFields,
  stripKeySuffixFromValue,
  addKeySuffixToValue,
} from './key-suffix';
import { FieldDef } from '../../definitions/base/field-def';

describe('key-suffix', () => {
  describe('extractSuffixFromUuid', () => {
    it('should extract first 8 chars from UUID without dashes', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      expect(extractSuffixFromUuid(uuid)).toBe('a1b2c3d4');
    });

    it('should handle UUIDs without dashes', () => {
      const uuid = 'a1b2c3d4e5f67890abcdef1234567890';
      expect(extractSuffixFromUuid(uuid)).toBe('a1b2c3d4');
    });
  });

  describe('addKeySuffixToField', () => {
    it('should add suffix to field key', () => {
      const field: FieldDef<unknown> = { key: 'name', type: 'input' };
      const result = addKeySuffixToField(field, 'abc12345');
      expect(result.key).toBe('name_abc12345');
    });

    it('should preserve undefined key', () => {
      const field: FieldDef<unknown> = { type: 'row' } as FieldDef<unknown>;
      const result = addKeySuffixToField(field, 'abc12345');
      expect(result.key).toBeUndefined();
    });

    it('should recursively add suffix to nested fields', () => {
      const field = {
        key: 'group',
        type: 'group',
        fields: [
          { key: 'name', type: 'input' },
          { key: 'email', type: 'input' },
        ],
      } as FieldDef<unknown>;

      const result = addKeySuffixToField(field, 'abc12345');

      expect(result.key).toBe('group_abc12345');
      expect((result as { fields: FieldDef<unknown>[] }).fields[0].key).toBe('name_abc12345');
      expect((result as { fields: FieldDef<unknown>[] }).fields[1].key).toBe('email_abc12345');
    });

    it('should handle deeply nested fields', () => {
      const field = {
        key: 'outer',
        type: 'group',
        fields: [
          {
            key: 'inner',
            type: 'group',
            fields: [{ key: 'deep', type: 'input' }],
          },
        ],
      } as FieldDef<unknown>;

      const result = addKeySuffixToField(field, 'xyz');
      const inner = (result as { fields: FieldDef<unknown>[] }).fields[0];
      const deep = (inner as { fields: FieldDef<unknown>[] }).fields[0];

      expect(result.key).toBe('outer_xyz');
      expect(inner.key).toBe('inner_xyz');
      expect(deep.key).toBe('deep_xyz');
    });

    it('should not mutate original field', () => {
      const field: FieldDef<unknown> = { key: 'name', type: 'input' };
      addKeySuffixToField(field, 'abc12345');
      expect(field.key).toBe('name');
    });
  });

  describe('addKeySuffixToFields', () => {
    it('should add suffix to all fields in array', () => {
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        { key: 'email', type: 'input' },
      ];

      const result = addKeySuffixToFields(fields, 'suffix');

      expect(result[0].key).toBe('name_suffix');
      expect(result[1].key).toBe('email_suffix');
    });
  });

  describe('stripKeySuffixFromValue', () => {
    it('should strip suffix from object keys', () => {
      const value = { name_abc12345: 'John', email_abc12345: 'john@example.com' };
      const result = stripKeySuffixFromValue(value, 'abc12345');
      expect(result).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('should handle nested objects', () => {
      const value = {
        contact_abc: {
          name_abc: 'John',
          address_abc: {
            city_abc: 'NYC',
          },
        },
      };
      const result = stripKeySuffixFromValue(value, 'abc');
      expect(result).toEqual({
        contact: {
          name: 'John',
          address: {
            city: 'NYC',
          },
        },
      });
    });

    it('should handle arrays in values', () => {
      const value = {
        items_abc: [{ name_abc: 'Item 1' }, { name_abc: 'Item 2' }],
      };
      const result = stripKeySuffixFromValue(value, 'abc');
      expect(result).toEqual({
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      });
    });

    it('should preserve keys without suffix', () => {
      const value = { name: 'John', email_abc: 'john@example.com' };
      const result = stripKeySuffixFromValue(value, 'abc');
      expect(result).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('should handle null and undefined', () => {
      expect(stripKeySuffixFromValue(null, 'abc')).toBeNull();
      expect(stripKeySuffixFromValue(undefined, 'abc')).toBeUndefined();
    });

    it('should handle primitive values', () => {
      expect(stripKeySuffixFromValue('string', 'abc')).toBe('string');
      expect(stripKeySuffixFromValue(123, 'abc')).toBe(123);
      expect(stripKeySuffixFromValue(true, 'abc')).toBe(true);
    });
  });

  describe('addKeySuffixToValue', () => {
    it('should add suffix to object keys', () => {
      const value = { name: 'John', email: 'john@example.com' };
      const result = addKeySuffixToValue(value, 'abc');
      expect(result).toEqual({ name_abc: 'John', email_abc: 'john@example.com' });
    });

    it('should handle nested objects', () => {
      const value = {
        contact: {
          name: 'John',
        },
      };
      const result = addKeySuffixToValue(value, 'abc');
      expect(result).toEqual({
        contact_abc: {
          name_abc: 'John',
        },
      });
    });

    it('should handle null and undefined', () => {
      expect(addKeySuffixToValue(null, 'abc')).toBeNull();
      expect(addKeySuffixToValue(undefined, 'abc')).toBeUndefined();
    });

    it('should be reversible with stripKeySuffixFromValue', () => {
      const original = { name: 'John', nested: { email: 'john@example.com' } };
      const suffixed = addKeySuffixToValue(original, 'abc12345');
      const restored = stripKeySuffixFromValue(suffixed, 'abc12345');
      expect(restored).toEqual(original);
    });
  });
});
