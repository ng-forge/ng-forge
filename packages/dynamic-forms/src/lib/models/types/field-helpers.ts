/**
 * Helper types for creating type-safe field configurations with proper nesting constraints
 */

import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';

/**
 * Type helper for accessing nested field paths safely
 * This allows accessing child paths while maintaining some type safety
 */
export type FieldPathAccess<TValue> = {
  [K in keyof TValue]: SchemaPath<TValue[K]> | SchemaPathTree<TValue[K]>;
};
