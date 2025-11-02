/**
 * Compare two values using the specified operator
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
 * Get nested value from object using dot notation path
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj);
}
