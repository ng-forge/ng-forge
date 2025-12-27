import { describe, it, expect } from 'vitest';
import { HiddenField, isHiddenField } from '../../definitions/default/hidden-field';
import { FieldDef } from '../../definitions/base/field-def';
import { validateRowNesting, RowField } from '../../definitions/default/row-field';

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

  describe('row nesting validation (warnings)', () => {
    it('should detect hidden fields directly inside rows', () => {
      const row = {
        type: 'row',
        fields: [
          { type: 'input', key: 'name', value: '' },
          { type: 'hidden', key: 'id', value: '123' },
        ],
      } as RowField;

      // Returns false when hidden fields are present (triggers warning)
      expect(validateRowNesting(row)).toBe(false);
    });

    it('should detect hidden fields inside groups within rows', () => {
      const row = {
        type: 'row',
        fields: [
          {
            type: 'group',
            key: 'data',
            fields: [
              { type: 'input', key: 'name', value: '' },
              { type: 'hidden', key: 'id', value: '123' },
            ],
          },
        ],
      } as RowField;

      // Returns false when hidden fields are present (triggers warning)
      expect(validateRowNesting(row)).toBe(false);
    });

    it('should pass for rows without hidden fields', () => {
      const row = {
        type: 'row',
        fields: [
          { type: 'input', key: 'firstName', value: '' },
          { type: 'input', key: 'lastName', value: '' },
        ],
      } as RowField;

      expect(validateRowNesting(row)).toBe(true);
    });

    it('should pass for rows with groups containing only visible fields', () => {
      const row = {
        type: 'row',
        fields: [
          {
            type: 'group',
            key: 'name',
            fields: [
              { type: 'input', key: 'first', value: '' },
              { type: 'input', key: 'last', value: '' },
            ],
          },
        ],
      } as RowField;

      expect(validateRowNesting(row)).toBe(true);
    });
  });
});
