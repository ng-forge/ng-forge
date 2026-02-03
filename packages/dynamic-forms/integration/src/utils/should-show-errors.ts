import { Signal, computed } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Computed signal that determines if errors should be displayed.
 * Based on field's invalid, touched, and error count.
 *
 * @param field - Signal containing FieldTree
 * @returns Signal<boolean> - True if errors should be displayed
 */
export function shouldShowErrors<T>(field: Signal<FieldTree<T>>): Signal<boolean> {
  return computed(() => {
    const fieldTree = field();
    const control = fieldTree();

    return control.invalid() && control.touched() && control.errors().length > 0;
  });
}
