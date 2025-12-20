/**
 * Native JavaScript utility functions to replace lodash-es
 * These are simple implementations for common object manipulation patterns
 */

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
 * Performs a deep equality comparison between two values
 * Native replacement for lodash isEqual()
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
 * ```
 */
export function isEqual(a: unknown, b: unknown): boolean {
  // Same reference or both null/undefined
  if (a === b) return true;

  // One is null/undefined but not both
  if (a == null || b == null) return false;

  // Different types
  if (typeof a !== typeof b) return false;

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => keysB.includes(key) && isEqual(objA[key], objB[key]));
  }

  // Primitives - use Object.is to handle NaN correctly (NaN === NaN is false, but Object.is(NaN, NaN) is true)
  return Object.is(a, b);
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
