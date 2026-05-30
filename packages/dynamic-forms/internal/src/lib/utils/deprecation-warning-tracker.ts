import { InjectionToken } from '@angular/core';
import type { WarningTracker } from './warning-tracker';

/**
 * Injection token for the deprecation warning tracker.
 * Provided at form component level for instance-scoped tracking of deprecated API usages
 * (keyed by deprecation id) so the same warning fires once per form rather than every render.
 *
 * @internal
 */
export const DEPRECATION_WARNING_TRACKER = new InjectionToken<WarningTracker>('DeprecationWarningTracker');
