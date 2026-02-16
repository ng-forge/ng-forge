import { FieldTree } from '@angular/forms/signals';

/**
 * Represents a FieldTree node for dynamic bracket-access navigation.
 *
 * TypeScript's `Subfields<T>` type on `FieldTree` only allows statically-known keys,
 * but at runtime the form tree supports arbitrary string key access (e.g., `rootForm['address']`).
 * This type makes that dynamic access explicit: each string key maps to a `FieldTree | undefined`.
 */
export type FieldTreeRecord = Record<string, FieldTree<unknown> | undefined>;

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
