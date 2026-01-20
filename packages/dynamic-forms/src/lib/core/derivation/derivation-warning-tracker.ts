import { InjectionToken } from '@angular/core';

/**
 * Tracks fields that have already been warned about to prevent log spam.
 * Scoped to a single form instance via DI.
 *
 * This replaces the module-level Set to avoid SSR/testing issues where
 * warnings from one form instance would suppress warnings for all others.
 *
 * @public
 */
export interface DerivationWarningTracker {
  /** Set of field keys we've already warned about */
  warnedFields: Set<string>;
}

/**
 * Injection token for the derivation warning tracker.
 * Provided at form component level for instance-scoped tracking.
 *
 * @public
 */
export const DERIVATION_WARNING_TRACKER = new InjectionToken<DerivationWarningTracker>('DerivationWarningTracker', {
  providedIn: null,
  factory: () => ({ warnedFields: new Set<string>() }),
});

/**
 * Creates a fresh warning tracker instance.
 *
 * @returns A new DerivationWarningTracker with an empty warnedFields Set
 *
 * @public
 */
export function createDerivationWarningTracker(): DerivationWarningTracker {
  return { warnedFields: new Set<string>() };
}
