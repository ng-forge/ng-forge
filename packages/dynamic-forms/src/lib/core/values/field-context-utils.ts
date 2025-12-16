import { FieldTree } from '@angular/forms/signals';

/**
 * Internal interface for accessing FieldTree's internal parent/key properties.
 * These properties exist at runtime but are not exposed in Angular's public API.
 */
interface FieldTreeInternal {
  parent?: FieldTreeInternal;
  key?: string | number;
}

/**
 * Type guard to check if a field has a parent property
 */
function hasParent(field: unknown): field is FieldTreeInternal & { parent: FieldTreeInternal } {
  return typeof field === 'object' && field !== null && 'parent' in field && (field as FieldTreeInternal).parent != null;
}

/**
 * Get the root field from a field tree by traversing up the parent chain
 */
export function getRootField(field: FieldTree<unknown>): FieldTree<unknown> | null {
  let current: FieldTree<unknown> | FieldTreeInternal = field;
  // Traverse up to find the root field (one with no parent)
  while (hasParent(current)) {
    current = current.parent;
  }
  return current as FieldTree<unknown>;
}

/**
 * Build the field path as a dot-separated string from the field's position in the tree
 */
export function buildFieldPath(field: FieldTree<unknown>): string {
  const pathSegments: string[] = [];
  let current: FieldTree<unknown> | FieldTreeInternal = field;

  // Traverse up the tree collecting path segments
  while (hasParent(current)) {
    const key = (current as FieldTreeInternal).key;
    if (key !== undefined && key !== null) {
      pathSegments.unshift(String(key));
    }
    current = current.parent;
  }

  return pathSegments.join('.');
}
