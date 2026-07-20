/**
 * Native JavaScript utility functions to replace lodash-es
 * These are simple implementations for common object manipulation patterns
 */

import { DynamicFormError } from '../errors/dynamic-form-error';

/**
 * Performs a deep equality comparison between two values.
 *
 * Symbol-keyed properties are intentionally ignored: form values carry
 * enumerable symbol metadata stamped by Angular Signal Forms, and comparing it
 * would make structurally equal values compare unequal. Only string keys count.
 *
 * @param a - First value
 * @param b - Second value
 * @returns true if values are deeply equal by their string-keyed properties
 */
export function isEqual(a: unknown, b: unknown): boolean {
  return isEqualInternal(a, b, new WeakMap(), new WeakMap());
}

/**
 * Internal implementation with circular reference tracking.
 *
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
  const recordA = a as Record<string, unknown>;
  const recordB = b as Record<string, unknown>;

  // String keys only: Signal Forms stamps enumerable symbol-keyed tracking
  // metadata onto array item values (fresh Symbol per rebuild), so comparing
  // symbol keys makes structurally equal form values compare unequal and
  // write-back loops never converge.
  const keysA = Object.keys(recordA);
  const keysB = Object.keys(recordB);

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
 * Deep-merges `value` into `defaults`, producing a new object that contains every
 * key from `defaults` plus any overrides from `value`. Plain-object values at
 * matching keys are merged recursively; primitives, dates, and class instances
 * in `value` replace the corresponding default wholesale.
 */
export function deepMergeDefaults<T extends Record<string, unknown>>(defaults: T, value: Record<string, unknown> | null | undefined): T {
  if (value == null) return { ...defaults };

  const result: Record<string, unknown> = { ...defaults };

  for (const key of Object.keys(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;

    const incoming = value[key];
    const existing = result[key];

    if (isPlainObject(existing) && isPlainObject(incoming)) {
      result[key] = deepMergeDefaults(existing, incoming);
    } else if (Array.isArray(existing) && Array.isArray(incoming)) {
      result[key] = mergeArrayDefaults(existing, incoming);
    } else {
      result[key] = incoming;
    }
  }

  return result as T;
}

/**
 * @internal
 * Merges a value array into a defaults array element-wise when their lengths
 * match. When lengths differ — the runtime case: prepend, insert, append,
 * remove — we return the value array reference as-is so we don't produce
 * fresh inner object references for items that already have every declared
 * sub-field key. Replacing references during the linkedSignal source
 * recompute that runs after Signal Forms wrote the array would otherwise
 * desync item FieldTrees from the rendered DOM rows.
 *
 * When lengths match (the declared/initial-value path the array fix targets)
 * each `defaults[i]`/`value[i]` pair is deep-merged when both are plain
 * objects so partial array-item values don't drop sibling sub-field keys.
 */
function mergeArrayDefaults(defaults: readonly unknown[], value: readonly unknown[]): readonly unknown[] {
  if (defaults.length !== value.length) return value;

  // Short-circuit when no element pair would be deep-merged. Returning a fresh
  // .map() result for primitive arrays (e.g. tags: ['a', 'b']) hands Signal
  // Forms a new reference on every call and rebuilds item FieldTrees needlessly.
  if (!value.some((item, i) => isPlainObject(defaults[i]) && isPlainObject(item))) return value;

  return value.map((item, i) => {
    const defaultItem = defaults[i];
    if (isPlainObject(defaultItem) && isPlainObject(item)) {
      return deepMergeDefaults(defaultItem, item);
    }
    return item;
  });
}

/**
 * @internal
 * Returns true for objects that should be deep-merged (plain objects produced
 * by literals or `Object.create(null)`); false for arrays, Dates, RegExps,
 * Maps, Sets, class instances, and primitives.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/** Options for memoize function */
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
 * @param previous - Previous object state
 * @param current - Current object state
 * @returns Set of keys that have different values
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

/** Compile-time exhaustiveness check for discriminated unions. */
export function assertNever(value: never): never {
  throw new DynamicFormError(`Unexpected value: ${JSON.stringify(value)}`);
}
