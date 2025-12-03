import { describe, it, expect } from 'vitest';
import { omit, keyBy, mapValues } from './object-utils';

describe('object-utils', () => {
  describe('omit', () => {
    it('should remove specified keys from object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = omit(obj, ['b']);

      expect(result).toEqual({ a: 1, c: 3 });
      expect(result).not.toHaveProperty('b');
    });

    it('should remove multiple keys', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = omit(obj, ['b', 'd']);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should return copy when no keys specified', () => {
      const obj = { a: 1, b: 2 };
      const result = omit(obj, []);

      expect(result).toEqual(obj);
      expect(result).not.toBe(obj); // Different reference
    });

    it('should handle non-existent keys gracefully', () => {
      const obj = { a: 1, b: 2 };
      const result = omit(obj, ['c' as any]);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should not mutate original object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const original = { ...obj };
      omit(obj, ['b']);

      expect(obj).toEqual(original);
    });

    it('should handle empty object', () => {
      const obj = {};
      const result = omit(obj, []);

      expect(result).toEqual({});
    });
  });

  describe('keyBy', () => {
    it('should create object keyed by specified property', () => {
      const users = [
        { id: 'a', name: 'Alice' },
        { id: 'b', name: 'Bob' },
      ];
      const result = keyBy(users, 'id');

      expect(result).toEqual({
        a: { id: 'a', name: 'Alice' },
        b: { id: 'b', name: 'Bob' },
      });
    });

    it('should handle numeric keys', () => {
      const items = [
        { id: 1, value: 'first' },
        { id: 2, value: 'second' },
      ];
      const result = keyBy(items, 'id');

      expect(result).toEqual({
        '1': { id: 1, value: 'first' },
        '2': { id: 2, value: 'second' },
      });
    });

    it('should handle empty array', () => {
      const result = keyBy([], 'id');

      expect(result).toEqual({});
    });

    it('should overwrite duplicate keys with last occurrence', () => {
      const items = [
        { id: 'a', value: 'first' },
        { id: 'a', value: 'second' },
      ];
      const result = keyBy(items, 'id');

      expect(result).toEqual({
        a: { id: 'a', value: 'second' },
      });
    });

    it('should work with different property types', () => {
      const items = [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
      ];
      const result = keyBy(items, 'code');

      expect(result).toEqual({
        USD: { code: 'USD', name: 'US Dollar' },
        EUR: { code: 'EUR', name: 'Euro' },
      });
    });
  });

  describe('mapValues', () => {
    it('should transform object values', () => {
      const obj = { a: 1, b: 2 };
      const result = mapValues(obj, (v) => v * 2);

      expect(result).toEqual({ a: 2, b: 4 });
    });

    it('should pass key to transformation function', () => {
      const obj = { firstName: 'john', lastName: 'doe' };
      const result = mapValues(obj, (v, k) => `${k}: ${v}`);

      expect(result).toEqual({
        firstName: 'firstName: john',
        lastName: 'lastName: doe',
      });
    });

    it('should change value type', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = mapValues(obj, (v) => v > 1);

      expect(result).toEqual({ a: false, b: true, c: true });
    });

    it('should handle empty object', () => {
      const result = mapValues({}, (v) => v);

      expect(result).toEqual({});
    });

    it('should not mutate original object', () => {
      const obj = { a: 1, b: 2 };
      const original = { ...obj };
      mapValues(obj, (v) => v * 2);

      expect(obj).toEqual(original);
    });

    it('should handle complex transformations', () => {
      const obj = { x: 1, y: 2, z: 3 };
      const result = mapValues(obj, (v, k) => ({ key: k, value: v, doubled: v * 2 }));

      expect(result).toEqual({
        x: { key: 'x', value: 1, doubled: 2 },
        y: { key: 'y', value: 2, doubled: 4 },
        z: { key: 'z', value: 3, doubled: 6 },
      });
    });
  });
});
