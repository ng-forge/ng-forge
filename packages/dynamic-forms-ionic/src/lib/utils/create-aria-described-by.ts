import { computed, Signal } from '@angular/core';
import { ResolvedError } from '@ng-forge/dynamic-forms/integration';

/**
 * Creates a signal that computes the aria-describedby value based on errors and hint state.
 * Both hint and error are included when present - hint is always shown, and only the first
 * error is displayed.
 *
 * @param errorsToDisplay Signal containing the array of errors currently being displayed
 * @param errorId Signal containing the ID for the error element (single error only)
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
    const parts: string[] = [];
    if (hasHint()) {
      parts.push(hintId());
    }
    if (errorsToDisplay().length > 0) {
      parts.push(errorId());
    }
    return parts.length > 0 ? parts.join(' ') : null;
  });
}
