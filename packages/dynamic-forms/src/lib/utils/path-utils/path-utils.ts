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
 * Splits a dot-separated path into segments.
 *
 * Handles both dot notation and bracket notation for array indices.
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
 * ```
 *
 * @public
 */
export function splitPath(path: string): string[] {
  if (!path) return [];
  return path.split('.');
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
