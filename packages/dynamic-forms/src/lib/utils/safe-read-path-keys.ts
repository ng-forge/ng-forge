import { untracked } from '@angular/core';
import { FieldContext } from '@angular/forms/signals';

/**
 * Safely reads `pathKeys` from a FieldContext.
 * Returns an empty array if `pathKeys` is not available (e.g., in tests or older Angular versions).
 *
 * Always reads with `untracked()` because `pathKeys` is stable for the lifetime of a field —
 * array items don't change index after creation, so there's no need to establish a reactive
 * dependency on this signal.
 */
export function safeReadPathKeys(fieldContext: FieldContext<unknown>): readonly string[] {
  if (!('pathKeys' in fieldContext) || typeof fieldContext.pathKeys !== 'function') {
    return [];
  }
  return untracked(() => fieldContext.pathKeys());
}
