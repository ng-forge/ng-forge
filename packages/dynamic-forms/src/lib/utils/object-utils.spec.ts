import { vi } from 'vitest';
import { deepMergeDefaults, omit, keyBy, mapValues, memoize } from './object-utils';

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

  describe('memoize', () => {
    it('should cache function results', () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn);

      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should compute for different arguments', () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn);

      expect(memoized(1, 2)).toBe(3);
      expect(memoized(2, 3)).toBe(5);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use custom resolver for cache key', () => {
      const fn = vi.fn((obj: { id: number; value: string }) => obj.value.toUpperCase());
      const memoized = memoize(fn, (obj) => String(obj.id));

      expect(memoized({ id: 1, value: 'hello' })).toBe('HELLO');
      // Same id, different value - should return cached
      expect(memoized({ id: 1, value: 'world' })).toBe('HELLO');
      expect(fn).toHaveBeenCalledTimes(1);

      // Different id - should compute
      expect(memoized({ id: 2, value: 'world' })).toBe('WORLD');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should accept resolver via options object', () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn, { resolver: (a, b) => `${a}-${b}` });

      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should evict oldest entry when maxSize is exceeded', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn, { maxSize: 2 });

      // Fill cache
      expect(memoized(1)).toBe(2);
      expect(memoized(2)).toBe(4);
      expect(fn).toHaveBeenCalledTimes(2);

      // Add third entry - should evict first
      expect(memoized(3)).toBe(6);
      expect(fn).toHaveBeenCalledTimes(3);

      // First entry should have been evicted
      expect(memoized(1)).toBe(2);
      expect(fn).toHaveBeenCalledTimes(4); // Had to recompute
    });

    it('should use LRU eviction policy', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn, { maxSize: 2 });

      // Fill cache with 1, 2
      memoized(1);
      memoized(2);
      expect(fn).toHaveBeenCalledTimes(2);

      // Access 1 again - moves it to end
      memoized(1);
      expect(fn).toHaveBeenCalledTimes(2); // Still cached

      // Add 3 - should evict 2 (oldest), not 1
      memoized(3);
      expect(fn).toHaveBeenCalledTimes(3);

      // 1 should still be cached
      memoized(1);
      expect(fn).toHaveBeenCalledTimes(3);

      // 2 should have been evicted
      memoized(2);
      expect(fn).toHaveBeenCalledTimes(4);
    });

    it('should work with maxSize of 1', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn, { maxSize: 1 });

      expect(memoized(1)).toBe(2);
      expect(memoized(1)).toBe(2);
      expect(fn).toHaveBeenCalledTimes(1);

      expect(memoized(2)).toBe(4);
      expect(fn).toHaveBeenCalledTimes(2);

      // Previous entry evicted
      expect(memoized(1)).toBe(2);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use default maxSize of 100', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn);

      // Fill cache to default limit
      for (let i = 0; i < 100; i++) {
        memoized(i);
      }
      expect(fn).toHaveBeenCalledTimes(100);

      // All 100 should be cached
      for (let i = 0; i < 100; i++) {
        memoized(i);
      }
      expect(fn).toHaveBeenCalledTimes(100);

      // Adding one more should evict the oldest
      memoized(100);
      expect(fn).toHaveBeenCalledTimes(101);

      // Entry 0 should have been evicted (LRU)
      memoized(0);
      expect(fn).toHaveBeenCalledTimes(102);
    });

    it('should handle resolver with maxSize', () => {
      const fn = vi.fn((obj: { key: string; data: number }) => obj.data * 2);
      const memoized = memoize(fn, {
        resolver: (obj) => obj.key,
        maxSize: 3,
      });

      // Fill cache with 3 entries
      memoized({ key: 'a', data: 1 });
      memoized({ key: 'b', data: 2 });
      memoized({ key: 'c', data: 3 });
      expect(fn).toHaveBeenCalledTimes(3);

      // All three should be cached
      memoized({ key: 'a', data: 1 });
      memoized({ key: 'b', data: 2 });
      memoized({ key: 'c', data: 3 });
      expect(fn).toHaveBeenCalledTimes(3);

      // Adding 'd' evicts 'a'
      memoized({ key: 'd', data: 4 });
      expect(fn).toHaveBeenCalledTimes(4);

      // 'a' was evicted, needs recompute
      memoized({ key: 'a', data: 1 });
      expect(fn).toHaveBeenCalledTimes(5);
    });
  });

  describe('deepMergeDefaults', () => {
    it('should preserve nested keys missing from value', () => {
      const defaults = { a: { line1: '', line2: '', city: '' }, b: 0 };
      const value = { a: { line1: 'X', city: 'Y' }, b: 1 };

      expect(deepMergeDefaults(defaults, value)).toEqual({
        a: { line1: 'X', line2: '', city: 'Y' },
        b: 1,
      });
    });

    it('should not mutate the input objects', () => {
      const defaults = { a: { x: 1 } };
      const value = { a: { y: 2 } };
      const defaultsClone = JSON.parse(JSON.stringify(defaults));
      const valueClone = JSON.parse(JSON.stringify(value));

      deepMergeDefaults(defaults, value);

      expect(defaults).toEqual(defaultsClone);
      expect(value).toEqual(valueClone);
    });

    it('should return a clone of defaults when value is null or undefined', () => {
      const defaults = { a: 1 };

      expect(deepMergeDefaults(defaults, null)).toEqual(defaults);
      expect(deepMergeDefaults(defaults, undefined)).toEqual(defaults);
      expect(deepMergeDefaults(defaults, null)).not.toBe(defaults);
    });

    it('should length-drive primitive arrays from the value (extra defaults are dropped)', () => {
      const defaults = { tags: ['a', 'b', 'c'] };
      const value = { tags: ['x'] };

      expect(deepMergeDefaults(defaults, value)).toEqual({ tags: ['x'] });
    });

    it('should merge object array elements positionally so partial items keep declared sub-field defaults', () => {
      const defaults = { items: [{ checkboxA: false, checkboxB: false }] };
      const value = { items: [{ checkboxA: true }] };

      expect(deepMergeDefaults(defaults, value)).toEqual({
        items: [{ checkboxA: true, checkboxB: false }],
      });
    });

    it('should pass through object array elements that have no matching default', () => {
      const defaults = { items: [{ checkboxA: false, checkboxB: false }] };
      const value = { items: [{ checkboxA: true, checkboxB: true }, { checkboxA: true }] };

      expect(deepMergeDefaults(defaults, value)).toEqual({
        items: [{ checkboxA: true, checkboxB: true }, { checkboxA: true }],
      });
    });

    it('should replace, not merge, when one side of an array element is not a plain object', () => {
      const defaults = { items: [{ a: 1 }, 'fallback'] };
      const value = { items: ['x', { a: 2 }] };

      expect(deepMergeDefaults(defaults, value)).toEqual({ items: ['x', { a: 2 }] });
    });

    it('should replace primitive overrides', () => {
      const defaults = { name: 'default', count: 0, ready: false };
      const value = { name: 'updated', count: 5, ready: true };

      expect(deepMergeDefaults(defaults, value)).toEqual(value);
    });

    it('should merge multiple levels of nested plain objects', () => {
      const defaults = {
        outer: { inner: { a: 1, b: 2 }, sibling: 'kept' },
      };
      const value = {
        outer: { inner: { a: 99 } },
      };

      expect(deepMergeDefaults(defaults, value)).toEqual({
        outer: { inner: { a: 99, b: 2 }, sibling: 'kept' },
      });
    });

    it('should treat Date and class instances as opaque (replace, do not merge)', () => {
      class Box {
        constructor(public n: number) {}
      }
      const date = new Date('2026-01-01T00:00:00Z');
      const defaults = { d: new Date('2024-01-01T00:00:00Z'), b: new Box(1) };
      const value = { d: date, b: new Box(2) };

      const result = deepMergeDefaults(defaults, value);

      expect(result.d).toBe(date);
      expect((result.b as Box).n).toBe(2);
    });

    it('should accept new keys present only in value', () => {
      const defaults = { a: 1 };
      const value = { a: 2, b: 3 } as Record<string, unknown>;

      expect(deepMergeDefaults<Record<string, unknown>>(defaults, value)).toEqual({ a: 2, b: 3 });
    });

    it('should let an explicit null override a plain-object default', () => {
      const defaults = { a: { x: 1 } };
      const value: Record<string, unknown> = { a: null };

      expect(deepMergeDefaults(defaults, value)).toEqual({ a: null });
    });

    it('should not be vulnerable to prototype pollution via __proto__', () => {
      const defaults: Record<string, unknown> = { a: 1 };
      const value = JSON.parse('{"__proto__": {"polluted": true}, "a": 2}') as Record<string, unknown>;

      const result = deepMergeDefaults(defaults, value);

      expect(result).toEqual({ a: 2 });
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    });

    it('should not merge constructor or prototype keys', () => {
      const defaults: Record<string, unknown> = { a: 1 };
      const value: Record<string, unknown> = { constructor: { evil: true }, prototype: { evil: true }, a: 2 };

      const result = deepMergeDefaults(defaults, value);

      expect(result).toEqual({ a: 2 });
    });
  });
});
