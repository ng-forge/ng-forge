/**
 * Utilities for parsing and manipulating field paths in dynamic forms.
 *
 * Field paths follow these formats:
 * - Simple: "fieldName"
 * - Nested: "parent.child.grandchild"
 * - Array indexed: "items.0.quantity" or "items[0].quantity"
 * - Array placeholder: "items.$.quantity" ($ = any index)
 *
 * @module path-utils
 */

/**
 * Result of parsing an array derivation path.
 *
 * @public
 */
export interface ArrayPathInfo {
  /** The array field path (e.g., "items" or "orders.lineItems") */
  arrayPath: string;

  /** The relative field path within the array item (e.g., "quantity" or "lineTotal") */
  relativePath: string;

  /** Whether this is a valid array path (contains .$. separator) */
  isArrayPath: boolean;
}

/**
 * Parses an array derivation path into its components.
 *
 * Array paths use the `$` placeholder to represent "any index".
 * Format: "arrayPath.$.relativePath"
 *
 * @param path - The path to parse (e.g., "items.$.quantity")
 * @returns Parsed path info with arrayPath and relativePath
 *
 * @example
 * ```typescript
 * parseArrayPath('items.$.quantity')
 * // { arrayPath: 'items', relativePath: 'quantity', isArrayPath: true }
 *
 * parseArrayPath('orders.lineItems.$.total')
 * // { arrayPath: 'orders.lineItems', relativePath: 'total', isArrayPath: true }
 *
 * parseArrayPath('simpleField')
 * // { arrayPath: '', relativePath: '', isArrayPath: false }
 * ```
 *
 * @public
 */
export function parseArrayPath(path: string): ArrayPathInfo {
  const ARRAY_PLACEHOLDER = '.$.';
  const placeholderIndex = path.indexOf(ARRAY_PLACEHOLDER);

  if (placeholderIndex === -1) {
    return {
      arrayPath: '',
      relativePath: '',
      isArrayPath: false,
    };
  }

  return {
    arrayPath: path.substring(0, placeholderIndex),
    relativePath: path.substring(placeholderIndex + ARRAY_PLACEHOLDER.length),
    isArrayPath: true,
  };
}

/**
 * Resolves an array placeholder path to a concrete indexed path.
 *
 * @param path - The path with $ placeholder (e.g., "items.$.quantity")
 * @param index - The array index to substitute
 * @returns Resolved path with index (e.g., "items.0.quantity")
 *
 * @example
 * ```typescript
 * resolveArrayPath('items.$.quantity', 2)
 * // 'items.2.quantity'
 *
 * resolveArrayPath('orders.lineItems.$.total', 0)
 * // 'orders.lineItems.0.total'
 * ```
 *
 * @public
 */
export function resolveArrayPath(path: string, index: number): string {
  const info = parseArrayPath(path);
  if (!info.isArrayPath) {
    return path;
  }
  return `${info.arrayPath}.${index}.${info.relativePath}`;
}

/**
 * Checks if a path contains an array placeholder.
 *
 * @param path - The path to check
 * @returns True if the path contains .$.
 *
 * @public
 */
export function isArrayPlaceholderPath(path: string): boolean {
  return path.includes('.$.');
}

/**
 * Extracts the array path from a path that may contain an array placeholder.
 *
 * @param path - The path to extract from
 * @returns The array path, or empty string if not an array path
 *
 * @example
 * ```typescript
 * extractArrayPath('items.$.quantity')
 * // 'items'
 *
 * extractArrayPath('orders.lineItems.$.total')
 * // 'orders.lineItems'
 *
 * extractArrayPath('simpleField')
 * // ''
 * ```
 *
 * @public
 */
export function extractArrayPath(path: string): string {
  return parseArrayPath(path).arrayPath;
}

/**
 * Splits a path into segments, supporting both dot notation and bracket notation.
 *
 * Handles:
 * - Dot notation: `parent.child.grandchild`
 * - Bracket notation: `items[0].quantity`
 * - Mixed notation: `items[0].address.city`
 *
 * @param path - The path to split
 * @returns Array of path segments
 *
 * @example
 * ```typescript
 * splitPath('parent.child.grandchild')
 * // ['parent', 'child', 'grandchild']
 *
 * splitPath('items.0.quantity')
 * // ['items', '0', 'quantity']
 *
 * splitPath('items[0].quantity')
 * // ['items', '0', 'quantity']
 *
 * splitPath('a[0][1].b')
 * // ['a', '0', '1', 'b']
 * ```
 *
 * @public
 */
export function splitPath(path: string): string[] {
  if (!path) return [];
  // Convert bracket notation [n] to .n, then split by dots
  // Filter out empty segments from leading/trailing/consecutive dots
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
}

/**
 * Joins path segments into a dot-separated path.
 *
 * @param segments - The path segments to join
 * @returns Joined path string
 *
 * @public
 */
export function joinPath(segments: string[]): string {
  return segments.join('.');
}

/**
 * Gets the parent path from a nested path.
 *
 * @param path - The path to get parent from
 * @returns The parent path, or empty string if no parent
 *
 * @example
 * ```typescript
 * getParentPath('parent.child.grandchild')
 * // 'parent.child'
 *
 * getParentPath('topLevel')
 * // ''
 * ```
 *
 * @public
 */
export function getParentPath(path: string): string {
  const segments = splitPath(path);
  if (segments.length <= 1) return '';
  return joinPath(segments.slice(0, -1));
}

/**
 * Gets the last segment (leaf) from a path.
 *
 * @param path - The path to get leaf from
 * @returns The last segment
 *
 * @example
 * ```typescript
 * getLeafPath('parent.child.grandchild')
 * // 'grandchild'
 *
 * getLeafPath('topLevel')
 * // 'topLevel'
 * ```
 *
 * @public
 */
export function getLeafPath(path: string): string {
  const segments = splitPath(path);
  return segments[segments.length - 1] ?? '';
}

// ============================================================================
// Multi-Array Path Utilities
// ============================================================================

/**
 * Result of parsing a path with multiple array placeholders.
 *
 * @public
 */
export interface MultiArrayPathInfo {
  /** Whether this path contains array placeholders */
  isArrayPath: boolean;

  /** Number of array placeholders in the path */
  placeholderCount: number;

  /** Path segments (excluding $ placeholders) */
  segments: string[];

  /** The positions of '$' in the split path (by part index) */
  placeholderPositions: number[];
}

/**
 * Parses a path that may contain multiple array placeholders.
 *
 * This supports deeply nested array structures like `orders.$.items.$.quantity`
 * where multiple levels of arrays need to be traversed.
 *
 * @param path - Path with zero or more $ placeholders
 * @returns Parsed path information
 *
 * @example
 * ```typescript
 * parseMultiArrayPath('orders.$.items.$.quantity')
 * // {
 * //   isArrayPath: true,
 * //   placeholderCount: 2,
 * //   segments: ['orders', 'items', 'quantity'],
 * //   placeholderPositions: [1, 3]
 * // }
 *
 * parseMultiArrayPath('items.$.name')
 * // {
 * //   isArrayPath: true,
 * //   placeholderCount: 1,
 * //   segments: ['items', 'name'],
 * //   placeholderPositions: [1]
 * // }
 *
 * parseMultiArrayPath('simpleField')
 * // {
 * //   isArrayPath: false,
 * //   placeholderCount: 0,
 * //   segments: ['simpleField'],
 * //   placeholderPositions: []
 * // }
 * ```
 *
 * @public
 */
export function parseMultiArrayPath(path: string): MultiArrayPathInfo {
  const parts = path.split('.');
  const segments: string[] = [];
  const placeholderPositions: number[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '$') {
      placeholderPositions.push(i);
    } else {
      segments.push(parts[i]);
    }
  }

  return {
    isArrayPath: placeholderPositions.length > 0,
    placeholderCount: placeholderPositions.length,
    segments,
    placeholderPositions,
  };
}

/**
 * Resolves a path with multiple array placeholders using provided indices.
 *
 * Each `$` placeholder is replaced with the corresponding index from the
 * indices array, in order.
 *
 * @param path - Path with $ placeholders (e.g., 'orders.$.items.$.quantity')
 * @param indices - Array of indices to substitute (e.g., [0, 2])
 * @returns Resolved path (e.g., 'orders.0.items.2.quantity')
 *
 * @throws Error if number of indices doesn't match number of placeholders
 *
 * @example
 * ```typescript
 * resolveMultiArrayPath('orders.$.items.$.quantity', [0, 2])
 * // 'orders.0.items.2.quantity'
 *
 * resolveMultiArrayPath('items.$.name', [5])
 * // 'items.5.name'
 * ```
 *
 * @public
 */
export function resolveMultiArrayPath(path: string, indices: number[]): string {
  const parts = path.split('.');
  let indexPointer = 0;

  const resolved = parts.map((part) => {
    if (part === '$') {
      if (indexPointer >= indices.length) {
        throw new Error(
          `Not enough indices provided for path '${path}'. ` +
            `Expected ${parts.filter((p) => p === '$').length} indices, got ${indices.length}.`,
        );
      }
      return String(indices[indexPointer++]);
    }
    return part;
  });

  if (indexPointer < indices.length) {
    throw new Error(`Too many indices provided for path '${path}'. ` + `Expected ${indexPointer} indices, got ${indices.length}.`);
  }

  return resolved.join('.');
}

/**
 * Counts the number of array placeholders in a path.
 *
 * @param path - The path to analyze
 * @returns Number of $ placeholders in the path
 *
 * @example
 * ```typescript
 * countArrayPlaceholders('orders.$.items.$.quantity')
 * // 2
 *
 * countArrayPlaceholders('items.$.name')
 * // 1
 *
 * countArrayPlaceholders('simpleField')
 * // 0
 * ```
 *
 * @public
 */
export function countArrayPlaceholders(path: string): number {
  return path.split('.').filter((part) => part === '$').length;
}
