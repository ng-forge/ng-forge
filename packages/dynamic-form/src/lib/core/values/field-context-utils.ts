import { FieldTree } from '@angular/forms/signals';

/**
 * Get the root field from a field tree by traversing up the parent chain
 */
export function getRootField(field: FieldTree<any>): FieldTree<any> | null {
  let current = field;
  // Traverse up to find the root field (one with no parent)
  while (current && (current as any).parent) {
    current = (current as any).parent;
  }
  return current;
}

/**
 * Build the field path as a dot-separated string from the field's position in the tree
 */
export function buildFieldPath(field: FieldTree<any>): string {
  const pathSegments: string[] = [];
  let current = field;

  // Traverse up the tree collecting path segments
  while (current && (current as any).parent) {
    const key = (current as any).key;
    if (key !== undefined && key !== null) {
      pathSegments.unshift(String(key));
    }
    current = (current as any).parent;
  }

  return pathSegments.join('.');
}
