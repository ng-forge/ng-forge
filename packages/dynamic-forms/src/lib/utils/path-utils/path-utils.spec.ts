import { describe, expect, it } from 'vitest';
import {
  parseArrayPath,
  resolveArrayPath,
  isArrayPlaceholderPath,
  extractArrayPath,
  splitPath,
  joinPath,
  getParentPath,
  getLeafPath,
  parseMultiArrayPath,
  resolveMultiArrayPath,
  countArrayPlaceholders,
} from './path-utils';

describe('path-utils', () => {
  describe('parseArrayPath', () => {
    it('should parse simple array path', () => {
      const result = parseArrayPath('items.$.quantity');
      expect(result).toEqual({
        arrayPath: 'items',
        relativePath: 'quantity',
        isArrayPath: true,
      });
    });

    it('should parse nested array path', () => {
      const result = parseArrayPath('orders.lineItems.$.total');
      expect(result).toEqual({
        arrayPath: 'orders.lineItems',
        relativePath: 'total',
        isArrayPath: true,
      });
    });

    it('should return isArrayPath false for non-array path', () => {
      const result = parseArrayPath('simpleField');
      expect(result).toEqual({
        arrayPath: '',
        relativePath: '',
        isArrayPath: false,
      });
    });

    it('should handle empty relative path', () => {
      const result = parseArrayPath('items.$.');
      expect(result).toEqual({
        arrayPath: 'items',
        relativePath: '',
        isArrayPath: true,
      });
    });

    it('should handle deeply nested relative path', () => {
      const result = parseArrayPath('items.$.address.city.name');
      expect(result).toEqual({
        arrayPath: 'items',
        relativePath: 'address.city.name',
        isArrayPath: true,
      });
    });
  });

  describe('resolveArrayPath', () => {
    it('should resolve array path with index', () => {
      const result = resolveArrayPath('items.$.quantity', 2);
      expect(result).toBe('items.2.quantity');
    });

    it('should return original path if no placeholder', () => {
      const result = resolveArrayPath('simpleField', 0);
      expect(result).toBe('simpleField');
    });

    it('should resolve with index 0', () => {
      const result = resolveArrayPath('items.$.name', 0);
      expect(result).toBe('items.0.name');
    });

    it('should resolve with large index', () => {
      const result = resolveArrayPath('items.$.name', 999);
      expect(result).toBe('items.999.name');
    });
  });

  describe('isArrayPlaceholderPath', () => {
    it('should return true for path with placeholder', () => {
      expect(isArrayPlaceholderPath('items.$.quantity')).toBe(true);
    });

    it('should return false for path without placeholder', () => {
      expect(isArrayPlaceholderPath('items.0.quantity')).toBe(false);
    });

    it('should return false for empty path', () => {
      expect(isArrayPlaceholderPath('')).toBe(false);
    });
  });

  describe('extractArrayPath', () => {
    it('should extract array path from placeholder path', () => {
      expect(extractArrayPath('items.$.quantity')).toBe('items');
    });

    it('should return empty string for non-array path', () => {
      expect(extractArrayPath('simpleField')).toBe('');
    });
  });

  describe('splitPath', () => {
    it('should split dot-separated path', () => {
      expect(splitPath('parent.child.grandchild')).toEqual(['parent', 'child', 'grandchild']);
    });

    it('should return empty array for empty path', () => {
      expect(splitPath('')).toEqual([]);
    });

    it('should handle single segment path', () => {
      expect(splitPath('singleField')).toEqual(['singleField']);
    });

    it('should handle path with numeric segments', () => {
      expect(splitPath('items.0.quantity')).toEqual(['items', '0', 'quantity']);
    });

    it('should handle bracket notation', () => {
      expect(splitPath('items[0].quantity')).toEqual(['items', '0', 'quantity']);
    });

    it('should handle consecutive bracket notation', () => {
      expect(splitPath('a[0][1].b')).toEqual(['a', '0', '1', 'b']);
    });

    it('should handle mixed dot and bracket notation', () => {
      expect(splitPath('orders[0].items[1].name')).toEqual(['orders', '0', 'items', '1', 'name']);
    });

    it('should handle bracket notation at the end', () => {
      expect(splitPath('items[0]')).toEqual(['items', '0']);
    });

    it('should handle path with only dots (returns empty array)', () => {
      expect(splitPath('...')).toEqual([]);
    });
  });

  describe('joinPath', () => {
    it('should join path segments', () => {
      expect(joinPath(['parent', 'child', 'grandchild'])).toBe('parent.child.grandchild');
    });

    it('should return empty string for empty array', () => {
      expect(joinPath([])).toBe('');
    });

    it('should handle single segment', () => {
      expect(joinPath(['singleField'])).toBe('singleField');
    });
  });

  describe('getParentPath', () => {
    it('should get parent path from nested path', () => {
      expect(getParentPath('parent.child.grandchild')).toBe('parent.child');
    });

    it('should return empty string for top-level field', () => {
      expect(getParentPath('topLevel')).toBe('');
    });

    it('should handle two-segment path', () => {
      expect(getParentPath('parent.child')).toBe('parent');
    });
  });

  describe('getLeafPath', () => {
    it('should get leaf from nested path', () => {
      expect(getLeafPath('parent.child.grandchild')).toBe('grandchild');
    });

    it('should return the path for single segment', () => {
      expect(getLeafPath('topLevel')).toBe('topLevel');
    });

    it('should return empty string for empty path', () => {
      expect(getLeafPath('')).toBe('');
    });
  });

  describe('parseMultiArrayPath', () => {
    it('should parse path with multiple placeholders', () => {
      const result = parseMultiArrayPath('orders.$.items.$.quantity');
      expect(result).toEqual({
        isArrayPath: true,
        placeholderCount: 2,
        segments: ['orders', 'items', 'quantity'],
        placeholderPositions: [1, 3],
      });
    });

    it('should parse path with single placeholder', () => {
      const result = parseMultiArrayPath('items.$.name');
      expect(result).toEqual({
        isArrayPath: true,
        placeholderCount: 1,
        segments: ['items', 'name'],
        placeholderPositions: [1],
      });
    });

    it('should parse path with no placeholders', () => {
      const result = parseMultiArrayPath('simpleField');
      expect(result).toEqual({
        isArrayPath: false,
        placeholderCount: 0,
        segments: ['simpleField'],
        placeholderPositions: [],
      });
    });
  });

  describe('resolveMultiArrayPath', () => {
    it('should resolve path with multiple placeholders', () => {
      const result = resolveMultiArrayPath('orders.$.items.$.quantity', [0, 2]);
      expect(result).toBe('orders.0.items.2.quantity');
    });

    it('should throw error when too few indices provided', () => {
      expect(() => resolveMultiArrayPath('orders.$.items.$.quantity', [0])).toThrow(/Not enough indices provided/);
    });

    it('should throw error when too many indices provided', () => {
      expect(() => resolveMultiArrayPath('orders.$.items.$.quantity', [0, 1, 2])).toThrow(/Too many indices provided/);
    });

    it('should throw error when indices provided for single placeholder path exceeds count', () => {
      expect(() => resolveMultiArrayPath('items.$.name', [0, 1])).toThrow(/Too many indices provided/);
    });

    it('should throw error when no indices provided for path with placeholders', () => {
      expect(() => resolveMultiArrayPath('items.$.name', [])).toThrow(/Not enough indices provided/);
    });

    it('should handle path with no placeholders', () => {
      const result = resolveMultiArrayPath('simpleField', []);
      expect(result).toBe('simpleField');
    });

    it('should throw error when indices provided for path without placeholders', () => {
      expect(() => resolveMultiArrayPath('simpleField', [0])).toThrow(/Too many indices provided/);
    });
  });

  describe('countArrayPlaceholders', () => {
    it('should count zero placeholders', () => {
      expect(countArrayPlaceholders('simpleField')).toBe(0);
    });

    it('should count one placeholder', () => {
      expect(countArrayPlaceholders('items.$.name')).toBe(1);
    });

    it('should count multiple placeholders', () => {
      expect(countArrayPlaceholders('orders.$.items.$.quantity')).toBe(2);
    });
  });

  // ============================================================================
  // Edge Case Tests
  // ============================================================================

  describe('edge cases', () => {
    describe('empty and malformed inputs', () => {
      it('parseArrayPath should handle empty string', () => {
        const result = parseArrayPath('');
        expect(result).toEqual({
          arrayPath: '',
          relativePath: '',
          isArrayPath: false,
        });
      });

      it('splitPath should handle consecutive dots (filters empty segments)', () => {
        expect(splitPath('items..name')).toEqual(['items', 'name']);
      });

      it('splitPath should handle leading dot (filters empty segments)', () => {
        expect(splitPath('.items.name')).toEqual(['items', 'name']);
      });

      it('splitPath should handle trailing dot (filters empty segments)', () => {
        expect(splitPath('items.name.')).toEqual(['items', 'name']);
      });

      it('parseArrayPath should handle just $ as path', () => {
        const result = parseArrayPath('$');
        expect(result).toEqual({
          arrayPath: '',
          relativePath: '',
          isArrayPath: false, // No .$. separator
        });
      });

      it('parseMultiArrayPath should handle just $ as path', () => {
        const result = parseMultiArrayPath('$');
        expect(result).toEqual({
          isArrayPath: true,
          placeholderCount: 1,
          segments: [],
          placeholderPositions: [0],
        });
      });

      it('getParentPath should handle empty path', () => {
        expect(getParentPath('')).toBe('');
      });

      it('joinPath should handle segments with dots', () => {
        // Dots within segments are not escaped - this documents current behavior
        expect(joinPath(['items.name', 'value'])).toBe('items.name.value');
      });
    });

    describe('numeric edge cases', () => {
      it('resolveArrayPath should handle negative index', () => {
        // Negative indices are passed through - consumer's responsibility
        const result = resolveArrayPath('items.$.name', -1);
        expect(result).toBe('items.-1.name');
      });

      it('resolveMultiArrayPath should handle negative indices', () => {
        const result = resolveMultiArrayPath('items.$.name', [-1]);
        expect(result).toBe('items.-1.name');
      });

      it('resolveMultiArrayPath should handle non-integer indices', () => {
        // Non-integers are stringified as-is
        const result = resolveMultiArrayPath('items.$.name', [1.5]);
        expect(result).toBe('items.1.5.name');
      });

      it('splitPath should preserve numeric string segments', () => {
        expect(splitPath('items.123.name')).toEqual(['items', '123', 'name']);
      });
    });

    describe('deeply nested paths', () => {
      it('should handle very deep nesting (10 levels)', () => {
        const deepPath = 'a.b.c.d.e.f.g.h.i.j';
        expect(splitPath(deepPath)).toHaveLength(10);
        expect(getLeafPath(deepPath)).toBe('j');
        expect(getParentPath(deepPath)).toBe('a.b.c.d.e.f.g.h.i');
      });

      it('should handle deep nesting with multiple placeholders', () => {
        const path = 'level1.$.level2.$.level3.$.value';
        const result = parseMultiArrayPath(path);
        expect(result.placeholderCount).toBe(3);
        expect(result.segments).toEqual(['level1', 'level2', 'level3', 'value']);
      });

      it('should resolve deep nesting with multiple indices', () => {
        const path = 'a.$.b.$.c.$.d';
        const result = resolveMultiArrayPath(path, [1, 2, 3]);
        expect(result).toBe('a.1.b.2.c.3.d');
      });
    });

    describe('special characters in path segments', () => {
      it('should handle unicode characters in path segments', () => {
        expect(splitPath('用户.$.名前')).toEqual(['用户', '$', '名前']);
      });

      it('should parse unicode array paths', () => {
        const result = parseArrayPath('用户.$.名前');
        expect(result).toEqual({
          arrayPath: '用户',
          relativePath: '名前',
          isArrayPath: true,
        });
      });

      it('should handle path segments with underscores and numbers', () => {
        expect(splitPath('field_1.sub_field_2.value_3')).toEqual(['field_1', 'sub_field_2', 'value_3']);
      });

      it('should handle camelCase and snake_case mixed', () => {
        expect(splitPath('camelCase.snake_case.PascalCase')).toEqual(['camelCase', 'snake_case', 'PascalCase']);
      });
    });

    describe('bracket notation', () => {
      it('splitPath should parse bracket notation correctly', () => {
        expect(splitPath('items[0].quantity')).toEqual(['items', '0', 'quantity']);
      });

      it('getLeafPath should extract numeric index from bracket notation', () => {
        expect(getLeafPath('items[0]')).toBe('0');
      });

      it('getParentPath should work with bracket notation', () => {
        expect(getParentPath('items[0].quantity')).toBe('items.0');
      });

      it('should handle deeply nested bracket notation', () => {
        expect(splitPath('a[0].b[1].c[2]')).toEqual(['a', '0', 'b', '1', 'c', '2']);
      });
    });
  });
});
