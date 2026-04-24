import { InjectionToken } from '@angular/core';
import { createWarningTracker, WarningTracker } from '../../utils/warning-tracker';

/**
 * Tracks fields that have already been warned about to prevent log spam.
 * Scoped to a single form instance via DI.
 *
 * @public
 */
export type DerivationWarningTracker = WarningTracker;

/**
 * Injection token for the derivation warning tracker.
 * Provided at form component level for instance-scoped tracking.
 *
 * @public
 */
export const DERIVATION_WARNING_TRACKER = new InjectionToken<DerivationWarningTracker>('DerivationWarningTracker', {
  providedIn: null,
  factory: createWarningTracker,
});

/**
 * Creates a fresh warning tracker instance.
 *
 * @public
 */
export const createDerivationWarningTracker = createWarningTracker;
