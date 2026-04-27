import { InjectionToken } from '@angular/core';
import { createWarningTracker, type WarningTracker } from '../../utils/warning-tracker';

/**
 * Injection token for the derivation warning tracker.
 * Provided at form component level for instance-scoped tracking of derivation warnings
 * (keyed by field path) so the same warning fires once per form rather than every render.
 *
 * @internal
 */
export const DERIVATION_WARNING_TRACKER = new InjectionToken<WarningTracker>('DerivationWarningTracker', {
  providedIn: null,
  factory: createWarningTracker,
});
