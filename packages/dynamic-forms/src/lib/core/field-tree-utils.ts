import { FieldTree } from '@angular/forms/signals';

/**
 * Type representing a FieldTree for an array.
 * Extends FieldTree to add numeric indexing for accessing item FieldTrees.
 */
export type ArrayFieldTree<T> = FieldTree<T[]> & {
  readonly [index: number]: FieldTree<T> | undefined;
};

/**
 * Get the length of an array FieldTree.
 */
export function getArrayLength<T>(arrayFieldTree: ArrayFieldTree<T>): number {
  const value = arrayFieldTree().value();
  return Array.isArray(value) ? value.length : 0;
}
