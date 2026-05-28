import { InjectionToken } from '@angular/core';

/**
 * Injection token for globally enabling form value emission on events.
 *
 * @internal
 */
export const EMIT_FORM_VALUE_ON_EVENTS = new InjectionToken<boolean>('EMIT_FORM_VALUE_ON_EVENTS', {
  providedIn: 'root',
  factory: () => false,
});
