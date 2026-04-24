import { InjectionToken } from '@angular/core';
import { createWarningTracker, WarningTracker } from './warning-tracker';

/**
 * Tracks deprecated API usages that have already been warned about to prevent log spam.
 * Scoped to a single form instance via DI (never module-scoped — SSR-unsafe).
 *
 * @public
 */
export type DeprecationWarningTracker = WarningTracker;

/**
 * Injection token for the deprecation warning tracker.
 * Provided at form component level for instance-scoped tracking.
 *
 * @public
 */
export const DEPRECATION_WARNING_TRACKER = new InjectionToken<DeprecationWarningTracker>('DeprecationWarningTracker');

/**
 * Creates a fresh deprecation warning tracker instance.
 *
 * @public
 */
export const createDeprecationWarningTracker = createWarningTracker;
