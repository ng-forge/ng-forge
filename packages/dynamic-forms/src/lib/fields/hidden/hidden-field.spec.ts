import { describe, it, expect } from 'vitest';
import { HiddenField, isHiddenField } from '../../definitions/default/hidden-field';
import { hiddenFieldMapper } from '../../mappers/hidden/hidden-field-mapper';
import { FieldDef } from '../../definitions/base/field-def';

describe('HiddenField', () => {
  describe('type definition', () => {
    it('should create a hidden field with string value', () => {
      const field: HiddenField<string> = {
        type: 'hidden',
        key: 'id',
        value: '123',
      };

      expect(field.type).toBe('hidden');
      expect(field.key).toBe('id');
      expect(field.value).toBe('123');
    });

    it('should create a hidden field with number value', () => {
      const field: HiddenField<number> = {
        type: 'hidden',
        key: 'userId',
        value: 42,
      };

      expect(field.type).toBe('hidden');
      expect(field.value).toBe(42);
    });

    it('should create a hidden field with boolean value', () => {
      const field: HiddenField<boolean> = {
        type: 'hidden',
        key: 'isActive',
        value: true,
      };

      expect(field.type).toBe('hidden');
      expect(field.value).toBe(true);
    });

    it('should create a hidden field with string array value', () => {
      const field: HiddenField<string[]> = {
        type: 'hidden',
        key: 'tags',
        value: ['a', 'b', 'c'],
      };

      expect(field.type).toBe('hidden');
      expect(field.value).toEqual(['a', 'b', 'c']);
    });

    it('should create a hidden field with number array value', () => {
      const field: HiddenField<number[]> = {
        type: 'hidden',
        key: 'tagIds',
        value: [1, 2, 3],
      };

      expect(field.type).toBe('hidden');
      expect(field.value).toEqual([1, 2, 3]);
    });

    it('should create a hidden field with boolean array value', () => {
      const field: HiddenField<boolean[]> = {
        type: 'hidden',
        key: 'flags',
        value: [true, false, true],
      };

      expect(field.type).toBe('hidden');
      expect(field.value).toEqual([true, false, true]);
    });

    it('should accept default HiddenValue type', () => {
      const field: HiddenField = {
        type: 'hidden',
        key: 'data',
        value: 'test',
      };

      expect(field.type).toBe('hidden');
    });
  });

  describe('isHiddenField type guard', () => {
    it('should return true for hidden field', () => {
      const field: HiddenField = {
        type: 'hidden',
        key: 'id',
        value: '123',
      };

      expect(isHiddenField(field)).toBe(true);
    });

    it('should return false for non-hidden field', () => {
      const field: FieldDef<unknown> = {
        type: 'input',
        key: 'name',
      };

      expect(isHiddenField(field)).toBe(false);
    });

    it('should return false for text field', () => {
      const field: FieldDef<unknown> = {
        type: 'text',
        key: 'label',
        label: 'Some text',
      };

      expect(isHiddenField(field)).toBe(false);
    });
  });

  describe('hiddenFieldMapper', () => {
    it('should return an empty signal', () => {
      const field: HiddenField<string> = {
        type: 'hidden',
        key: 'id',
        value: '123',
      };

      const result = hiddenFieldMapper(field);

      // Should return a signal with empty object
      expect(result()).toEqual({});
    });

    it('should return consistent empty object for any field', () => {
      const fields: HiddenField[] = [
        { type: 'hidden', key: 'id', value: '123' },
        { type: 'hidden', key: 'ids', value: [1, 2, 3] },
        { type: 'hidden', key: 'flag', value: true },
      ];

      fields.forEach((field) => {
        const result = hiddenFieldMapper(field);
        expect(result()).toEqual({});
      });
    });
  });
});
