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
export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
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
export function keyBy<T extends Record<string, any>>(array: T[], key: keyof T): Record<string, T> {
  return array.reduce(
    (acc, item) => {
      acc[item[key]] = item;
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
