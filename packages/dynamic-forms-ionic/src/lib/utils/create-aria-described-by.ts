import { computed, Signal } from '@angular/core';
import { ResolvedError } from '@ng-forge/dynamic-forms/integration';

/**
 * Creates a signal that computes the aria-describedby value based on errors and hint state.
 * Errors take precedence over hints - when errors are displayed, the hint is hidden.
 *
 * @param errorsToDisplay Signal containing the array of errors currently being displayed
 * @param errorId Signal containing the base ID for error elements
 * @param hintId Signal containing the ID for the hint element
 * @param hasHint Function that returns true if a hint is configured
 * @returns Signal containing the aria-describedby value (space-separated IDs) or null
 */
export function createAriaDescribedBySignal(
  errorsToDisplay: Signal<ResolvedError[]>,
  errorId: Signal<string>,
  hintId: Signal<string>,
  hasHint: () => boolean,
): Signal<string | null> {
  return computed(() => {
    const errors = errorsToDisplay();
    if (errors.length > 0) {
      return errors.map((_, i) => `${errorId()}-${i}`).join(' ');
    }
    if (hasHint()) {
      return hintId();
    }
    return null;
  });
}
