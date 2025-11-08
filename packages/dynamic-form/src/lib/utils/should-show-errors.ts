import { Signal, computed } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Computed signal that determines if errors should be displayed
 * Based on field's invalid, touched, and error count
 *
 * @param field - Signal containing FieldTree
 * @returns Signal<boolean> - True if errors should be displayed
 */
export function shouldShowErrors(field: Signal<FieldTree>): Signal<boolean> {
  return computed(() => {
    const f = field();
    return f.invalid() && f.touched() && f.errors().length > 0;
  });
}
