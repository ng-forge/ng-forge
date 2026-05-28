/**
 * Utilities for parsing and manipulating field paths in dynamic forms.
 *
 * @module path-utils
 */

/** Result of parsing an array derivation path. */
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
 * @param path - The path to parse (e.g., "items.$.quantity")
 * @returns Parsed path info with arrayPath and relativePath
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
 */
export function isArrayPlaceholderPath(path: string): boolean {
  return path.includes('.$.');
}

/**
 * Extracts the array path from a path that may contain an array placeholder.
 *
 * @param path - The path to extract from
 * @returns The array path, or empty string if not an array path
 */
export function extractArrayPath(path: string): string {
  return parseArrayPath(path).arrayPath;
}

/**
 * Splits a path into segments, supporting both dot notation and bracket notation.
 *
 * @param path - The path to split
 * @returns Array of path segments
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
 */
export function joinPath(segments: string[]): string {
  return segments.join('.');
}

/**
 * Gets the parent path from a nested path.
 *
 * @param path - The path to get parent from
 * @returns The parent path, or empty string if no parent
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
 */
export function getLeafPath(path: string): string {
  const segments = splitPath(path);
  return segments[segments.length - 1] ?? '';
}

// ============================================================================
// Multi-Array Path Utilities
// ============================================================================

/** Result of parsing a path with multiple array placeholders. */
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
 * @param path - Path with zero or more $ placeholders
 * @returns Parsed path information
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
 * @param path - Path with $ placeholders (e.g., 'orders.$.items.$.quantity')
 * @param indices - Array of indices to substitute (e.g., [0, 2])
 * @returns Resolved path (e.g., 'orders.0.items.2.quantity')
 * @throws Error if number of indices doesn't match number of placeholders
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
 */
export function countArrayPlaceholders(path: string): number {
  return path.split('.').filter((part) => part === '$').length;
}
