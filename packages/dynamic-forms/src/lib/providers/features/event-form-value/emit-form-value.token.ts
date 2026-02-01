import { InjectionToken } from '@angular/core';

/**
 * Injection token for globally enabling form value emission on events.
 *
 * When set to `true`, all events dispatched through the EventBus will include
 * the current form value in the `formValue` property.
 *
 * This token is configured via `withEventFormValue()` feature function.
 * Per-form overrides can be set via `options.emitFormValueOnEvents` in the form config.
 *
 * @internal
 */
export const EMIT_FORM_VALUE_ON_EVENTS = new InjectionToken<boolean>('EMIT_FORM_VALUE_ON_EVENTS', {
  providedIn: 'root',
  factory: () => false,
});
