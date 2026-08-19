import { Signal, computed } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Computed signal that determines if errors should be displayed.
 * Based on field's invalid, touched, and error count.
 *
 * @param field - Signal containing the FieldTree, or `undefined` before it exists
 * @returns Signal<boolean> - True if errors should be displayed
 */
export function shouldShowErrors<T>(field: Signal<FieldTree<T> | undefined>): Signal<boolean> {
  return computed(() => {
    const control = field()?.();
    if (!control) return false;

    return control.invalid() && control.touched() && control.errors().length > 0;
  });
}
