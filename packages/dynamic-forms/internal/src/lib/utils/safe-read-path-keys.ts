import { untracked } from '@angular/core';
import { FieldContext } from '@angular/forms/signals';

/**
 * Safely reads `pathKeys` from a FieldContext.
 * Returns an empty array if `pathKeys` is not available (e.g., in tests or older Angular versions).
 */
export function safeReadPathKeys(fieldContext: FieldContext<unknown>): readonly string[] {
  if (!('pathKeys' in fieldContext) || typeof fieldContext.pathKeys !== 'function') {
    return [];
  }
  return untracked(() => fieldContext.pathKeys());
}
