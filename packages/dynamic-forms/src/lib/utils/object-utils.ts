/**
 * Native JavaScript utility functions to replace lodash-es
 * These are simple implementations for common object manipulation patterns
 */

// Re-export isEqual from the internal utils library for backwards compatibility
// This allows existing imports from object-utils to continue working
export { isEqual } from '@ng-forge/utils';

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
  resolver?: (...args: Parameters<TFunc>) => string;
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
  resolverOrOptions?: ((...args: Parameters<TFunc>) => string) | MemoizeOptions<TFunc>,
): TFunc {
  const options: MemoizeOptions<TFunc> =
    typeof resolverOrOptions === 'function' ? { resolver: resolverOrOptions } : (resolverOrOptions ?? {});

  const { resolver, maxSize = DEFAULT_MEMOIZE_MAX_SIZE } = options;
  const cache = new Map<string, ReturnType<TFunc>>();

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
