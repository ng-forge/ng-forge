/**
 * Native JavaScript utility functions to replace lodash-es
 * These are simple implementations for common object manipulation patterns
 */

import { DynamicFormError } from '../errors/dynamic-form-error';

/**
 * Performs a deep equality comparison between two values.
 *
 * Handles:
 * - Primitives (including NaN via Object.is)
 * - Dates (by timestamp)
 * - Arrays (deep element comparison)
 * - Plain objects (deep property comparison)
 * - RegExp (by source and flags)
 * - Map and Set (by entries)
 * - Circular references (via WeakMap tracking)
 *
 * @param a - First value
 * @param b - Second value
 * @returns true if values are deeply equal
 *
 * @example
 * ```typescript
 * isEqual({ a: 1 }, { a: 1 }); // true
 * isEqual([1, 2], [1, 2]); // true
 * isEqual({ a: 1 }, { a: 2 }); // false
 * isEqual(new Date('2024-01-01'), new Date('2024-01-01')); // true
 * isEqual(/abc/gi, /abc/gi); // true
 * ```
 */
export function isEqual(a: unknown, b: unknown): boolean {
  return isEqualInternal(a, b, new WeakMap(), new WeakMap());
}

/**
 * Internal implementation with circular reference tracking.
 * @internal
 */
function isEqualInternal(a: unknown, b: unknown, seenA: WeakMap<object, object>, seenB: WeakMap<object, object>): boolean {
  // Same reference or both null/undefined
  if (a === b) return true;

  // Handle NaN (NaN === NaN is false, but we want it to be equal)
  if (typeof a === 'number' && typeof b === 'number') {
    return Object.is(a, b);
  }

  // One is null/undefined but not both
  if (a == null || b == null) return false;

  // Different types
  if (typeof a !== typeof b) return false;

  // Non-object primitives (strings, booleans, symbols, bigints)
  if (typeof a !== 'object') {
    return Object.is(a, b);
  }

  // At this point, both a and b are objects (typeof a === 'object')
  const objA = a as object;
  const objB = b as object;

  // Check for circular references
  if (seenA.has(objA) || seenB.has(objB)) {
    // If we've seen these objects before, check if they were paired together
    return seenA.get(objA) === objB && seenB.get(objB) === objA;
  }

  // Mark these objects as seen (paired together)
  seenA.set(objA, objB);
  seenB.set(objB, objA);

  // Different constructors means different types (e.g., Date vs Object)
  if (objA.constructor !== objB.constructor) return false;

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle RegExp
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  // Handle Map
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !isEqualInternal(value, b.get(key), seenA, seenB)) {
        return false;
      }
    }
    return true;
  }

  // Handle Set
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const value of a) {
      if (!b.has(value)) {
        // For non-primitive values in Sets, we need deep comparison
        // This is O(n^2) but Sets rarely contain objects
        if (typeof value === 'object' && value !== null) {
          let found = false;
          for (const bValue of b) {
            if (typeof bValue === 'object' && bValue !== null && isEqualInternal(value, bValue, seenA, seenB)) {
              found = true;
              break;
            }
          }
          if (!found) return false;
        } else {
          return false;
        }
      }
    }
    return true;
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqualInternal(item, b[index], seenA, seenB));
  }

  // Handle plain objects
  const recordA = a as Record<string | symbol, unknown>;
  const recordB = b as Record<string | symbol, unknown>;

  // Get both string and symbol keys
  const keysA = [...Object.keys(recordA), ...Object.getOwnPropertySymbols(recordA)];
  const keysB = [...Object.keys(recordB), ...Object.getOwnPropertySymbols(recordB)];

  if (keysA.length !== keysB.length) return false;

  // Create a Set for O(1) lookup
  const keySetB = new Set(keysB);

  return keysA.every((key) => keySetB.has(key) && isEqualInternal(recordA[key], recordB[key], seenA, seenB));
}

/**
 * Creates a new object without the specified keys
 * Native replacement for lodash omit()
 *
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns New object without specified keys
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * omit(obj, ['b']); // { a: 1, c: 3 }
 * ```
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result as Omit<T, K>;
}

/**
 * Creates an object from an array, keyed by a specified property
 * Native replacement for lodash keyBy()
 *
 * @param array - Source array
 * @param key - Property to use as key
 * @returns Object keyed by the specified property
 *
 * @example
 * ```typescript
 * const users = [{ id: 'a', name: 'Alice' }, { id: 'b', name: 'Bob' }];
 * keyBy(users, 'id'); // { a: { id: 'a', name: 'Alice' }, b: { id: 'b', name: 'Bob' } }
 * ```
 */
export function keyBy<T extends object>(array: T[], key: keyof T): Record<string, T> {
  return array.reduce(
    (acc, item) => {
      acc[String(item[key])] = item;
      return acc;
    },
    {} as Record<string, T>,
  );
}

/**
 * Maps object values through a transformation function
 * Native replacement for lodash mapValues()
 *
 * @param obj - Source object
 * @param fn - Transformation function
 * @returns New object with transformed values
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2 };
 * mapValues(obj, (v) => v * 2); // { a: 2, b: 4 }
 * ```
 */
export function mapValues<T, U>(obj: Record<string, T>, fn: (value: T, key: string) => U): Record<string, U> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      acc[key] = fn(value, key);
      return acc;
    },
    {} as Record<string, U>,
  );
}

/**
 * Options for memoize function
 */
/** Default maximum cache size for memoized functions */
const DEFAULT_MEMOIZE_MAX_SIZE = 100;

export interface MemoizeOptions<TFunc extends (...args: never[]) => unknown> {
  /** Optional function to generate cache key from arguments */
  resolver?: (...args: Parameters<TFunc>) => string | number;
  /** Maximum number of entries to keep in cache. Uses LRU eviction when exceeded. Defaults to 100. */
  maxSize?: number;
}

/**
 * Memoizes a function with LRU cache eviction and optional custom cache key resolver.
 *
 * @param fn - Function to memoize
 * @param resolverOrOptions - Optional key resolver function or options object
 * @returns Memoized function
 *
 * @example
 * ```typescript
 * const expensive = (a: number, b: number) => a + b;
 * const memoized = memoize(expensive); // Uses default maxSize of 100
 *
 * // With custom resolver
 * const withResolver = memoize(expensive, (a, b) => `${a}-${b}`);
 *
 * // With custom maxSize
 * const small = memoize(expensive, { maxSize: 10 });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memoize<TFunc extends (...args: any[]) => any>(
  fn: TFunc,
  resolverOrOptions?: ((...args: Parameters<TFunc>) => string | number) | MemoizeOptions<TFunc>,
): TFunc {
  const options: MemoizeOptions<TFunc> =
    typeof resolverOrOptions === 'function' ? { resolver: resolverOrOptions } : (resolverOrOptions ?? {});

  const { resolver, maxSize = DEFAULT_MEMOIZE_MAX_SIZE } = options;
  const cache = new Map<string | number, ReturnType<TFunc>>();

  return ((...args: Parameters<TFunc>): ReturnType<TFunc> => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    const cachedValue = cache.get(key);
    if (cachedValue !== undefined) {
      cache.delete(key);
      cache.set(key, cachedValue);
      return cachedValue;
    }

    const result = fn(...args);

    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, result);
    return result;
  }) as TFunc;
}

/**
 * Normalizes a fields collection to an array.
 * Handles both array format and object format (keyed by field key).
 *
 * @param fields - Fields as array or object
 * @returns Fields as array
 */
export function normalizeFieldsArray<T>(fields: readonly T[] | Record<string, T>): T[] {
  return Array.isArray(fields) ? [...fields] : Object.values(fields);
}

/**
 * Gets the keys that differ between two objects.
 *
 * Compares top-level keys and returns those whose values are different.
 * Uses deep equality comparison for nested values.
 *
 * @param previous - Previous object state
 * @param current - Current object state
 * @returns Set of keys that have different values
 *
 * @example
 * ```typescript
 * const prev = { a: 1, b: 2, c: 3 };
 * const curr = { a: 1, b: 5, d: 4 };
 * getChangedKeys(prev, curr); // Set { 'b', 'c', 'd' }
 * ```
 */
export function getChangedKeys(
  previous: Record<string, unknown> | null | undefined,
  current: Record<string, unknown> | null | undefined,
): Set<string> {
  const changedKeys = new Set<string>();

  // Handle null/undefined cases
  if (!previous && !current) return changedKeys;
  if (!previous) {
    return new Set(Object.keys(current ?? {}));
  }
  if (!current) {
    return new Set(Object.keys(previous));
  }

  // Collect all keys from both objects
  const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);

  // Check each key for differences
  for (const key of allKeys) {
    const prevValue = previous[key];
    const currValue = current[key];

    // Key added or removed
    if (!(key in previous) || !(key in current)) {
      changedKeys.add(key);
      continue;
    }

    // Value changed
    if (!isEqual(prevValue, currValue)) {
      changedKeys.add(key);
    }
  }

  return changedKeys;
}

/**
 * Fast 32-bit FNV-1a hash for strings.
 * Used as a cache key to avoid expensive string concatenation in memoize resolvers.
 *
 * @param str - String to hash
 * @returns 32-bit integer hash
 */
export function simpleStringHash(str: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) | 0; // FNV prime, keep as 32-bit int
  }
  return hash;
}

/**
 * Compile-time exhaustiveness check for discriminated unions.
 *
 * Place in the `default` branch of a `switch` over a union's discriminant.
 * TypeScript narrows the value to `never` only when every member is handled;
 * adding a new member without a matching `case` produces a type error here.
 *
 * At runtime, throws if somehow reached (defensive guard).
 *
 * @example
 * ```ts
 * switch (action.type) {
 *   case 'a': return handleA(action);
 *   case 'b': return handleB(action);
 *   default:  return assertNever(action);
 * }
 * ```
 */
export function assertNever(value: never): never {
  throw new DynamicFormError(`Unexpected value: ${JSON.stringify(value)}`);
}
