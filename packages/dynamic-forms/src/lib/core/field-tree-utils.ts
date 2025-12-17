import { FieldTree } from '@angular/forms/signals';

/**
 * Type representing a FieldTree for an array.
 * Extends FieldTree to add numeric indexing for accessing item FieldTrees.
 */
export type ArrayFieldTree<T> = FieldTree<T[]> & {
  readonly [index: number]: FieldTree<T> | undefined;
};

/**
 * Access a child FieldTree by key.
 *
 * @param parent The parent FieldTree
 * @param key The key of the child field
 * @returns The child FieldTree or undefined if not found
 */
export function getChildField<T extends Record<string, unknown>, K extends keyof T & string>(
  parent: FieldTree<T>,
  key: K,
): FieldTree<T[K]> | undefined {
  return (parent as Record<string, unknown>)[key] as FieldTree<T[K]> | undefined;
}

/**
 * Get the length of an array FieldTree.
 */
export function getArrayLength<T>(arrayFieldTree: ArrayFieldTree<T>): number {
  const value = arrayFieldTree().value();
  return Array.isArray(value) ? value.length : 0;
}
