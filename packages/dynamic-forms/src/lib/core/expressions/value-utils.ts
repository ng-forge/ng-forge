/**
 * Compares two values using the specified comparison operator.
 *
 * Supports various comparison types including equality, numerical comparisons,
 * string operations, and regular expression matching. Type coercion is applied
 * for numerical and string operations as needed.
 *
 * @param actual - The value to compare
 * @param expected - The value to compare against
 * @param operator - Comparison operator to use
 * @returns True if the comparison succeeds, false otherwise
 *
 * @example
 * ```typescript
 * // Equality checks
 * compareValues(10, 10, 'equals')        // true
 * compareValues('test', 'other', 'notEquals') // true
 *
 * // Numerical comparisons
 * compareValues(15, 10, 'greater')       // true
 * compareValues('5', 3, 'greaterOrEqual') // true (coerced to numbers)
 *
 * // String operations
 * compareValues('hello world', 'world', 'contains')   // true
 * compareValues('prefix-test', 'prefix', 'startsWith') // true
 * compareValues('test.jpg', '.jpg', 'endsWith')       // true
 *
 * // Regular expression matching
 * compareValues('test123', '^test\\d+$', 'matches')    // true
 * compareValues('invalid', '[invalid', 'matches')      // false (invalid regex)
 * ```
 */
export function compareValues(actual: unknown, expected: unknown, operator: string): boolean {
  switch (operator) {
    case 'equals':
      return actual === expected;
    case 'notEquals':
      return actual !== expected;
    case 'greater':
      return Number(actual) > Number(expected);
    case 'less':
      return Number(actual) < Number(expected);
    case 'greaterOrEqual':
      return Number(actual) >= Number(expected);
    case 'lessOrEqual':
      return Number(actual) <= Number(expected);
    case 'contains':
      return String(actual).includes(String(expected));
    case 'startsWith':
      return String(actual).startsWith(String(expected));
    case 'endsWith':
      return String(actual).endsWith(String(expected));
    case 'matches':
      try {
        return new RegExp(String(expected)).test(String(actual));
      } catch {
        return false;
      }
    default:
      return false;
  }
}

/**
 * Retrieves a nested value from an object using dot notation path.
 *
 * Safely traverses object properties using a dot-separated path string.
 * Returns undefined if any part of the path is missing or if the traversal
 * encounters a non-object value.
 *
 * @param obj - The object to traverse
 * @param path - Dot-separated path to the desired property
 * @returns The value at the specified path, or undefined if not found
 *
 * @example
 * ```typescript
 * const data = {
 *   user: {
 *     profile: {
 *       name: 'John',
 *       age: 30
 *     },
 *     settings: { theme: 'dark' }
 *   }
 * };
 *
 * getNestedValue(data, 'user.profile.name')  // 'John'
 * getNestedValue(data, 'user.settings.theme') // 'dark'
 * getNestedValue(data, 'user.profile.email')  // undefined
 * getNestedValue(data, 'nonexistent.path')    // undefined
 * getNestedValue(null, 'any.path')            // undefined
 * ```
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj);
}

/**
 * Checks whether a nested property exists in an object using dot notation path.
 *
 * Unlike `getNestedValue`, this distinguishes between a property that exists
 * with value `undefined` and a property path that doesn't exist at all.
 *
 * @param obj - The object to check
 * @param path - Dot-separated path to the property
 * @returns True if the property exists (even if its value is undefined)
 */
export function hasNestedProperty(obj: unknown, path: string): boolean {
  const keys = path.split('.');
  let current: unknown = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current || typeof current !== 'object') return false;
    current = (current as Record<string, unknown>)[keys[i]];
  }

  if (!current || typeof current !== 'object') return false;
  return keys[keys.length - 1] in (current as Record<string, unknown>);
}
