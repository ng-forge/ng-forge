import { InjectionToken } from '@angular/core';

/**
 * Tracks deprecated API usages that have already been warned about to prevent log spam.
 * Scoped to a single form instance via DI.
 *
 * This follows the same pattern as DerivationWarningTracker — DI-scoped rather than
 * module-scoped to avoid SSR issues where state would be shared across requests.
 *
 * @public
 */
export interface DeprecationWarningTracker {
  /** Set of deprecation keys we've already warned about */
  warnedKeys: Set<string>;
}

/**
 * Injection token for the deprecation warning tracker.
 * Provided at form component level for instance-scoped tracking.
 *
 * @public
 */
export const DEPRECATION_WARNING_TRACKER = new InjectionToken<DeprecationWarningTracker>('DeprecationWarningTracker', {
  providedIn: null,
  factory: () => ({ warnedKeys: new Set<string>() }),
});

/**
 * Creates a fresh deprecation warning tracker instance.
 *
 * @returns A new DeprecationWarningTracker with an empty warnedKeys Set
 *
 * @public
 */
export function createDeprecationWarningTracker(): DeprecationWarningTracker {
  return { warnedKeys: new Set<string>() };
}
