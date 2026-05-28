/**
 * Compares two values using the specified comparison operator.
 *
 * @param actual - The value to compare
 * @param expected - The value to compare against
 * @param operator - Comparison operator to use
 * @returns True if the comparison succeeds, false otherwise
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
 * @param obj - The object to traverse
 * @param path - Dot-separated path to the desired property
 * @returns The value at the specified path, or undefined if not found
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj);
}

/**
 * Checks whether a nested property exists in an object using dot notation path.
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
