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
