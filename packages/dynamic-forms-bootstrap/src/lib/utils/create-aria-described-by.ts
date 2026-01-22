import { computed, Signal } from '@angular/core';
import { ResolvedError } from '@ng-forge/dynamic-forms/integration';

/**
 * Creates a signal that computes the aria-describedby value based on errors and hint state.
 * Errors take precedence over hints - when errors are displayed, the hint is hidden.
 * Only the first error is displayed (single error ID, not indexed).
 *
 * @param errorsToDisplay Signal containing the array of errors currently being displayed
 * @param errorId Signal containing the ID for the error element (single error only)
 * @param hintId Signal containing the ID for the hint element
 * @param hasHint Function that returns true if a hint is configured
 * @returns Signal containing the aria-describedby value or null
 */
export function createAriaDescribedBySignal(
  errorsToDisplay: Signal<ResolvedError[]>,
  errorId: Signal<string>,
  hintId: Signal<string>,
  hasHint: () => boolean,
): Signal<string | null> {
  return computed(() => {
    if (errorsToDisplay().length > 0) {
      return errorId();
    }
    if (hasHint()) {
      return hintId();
    }
    return null;
  });
}
