import { InjectionToken } from '@angular/core';

/**
 * Injection token for globally enabling form value emission on events.
 *
 * When set to `true`, all events dispatched through the EventBus will include
 * the current form value in the `formValue` property.
 *
 * This token is typically configured via `withEventFormValue()` feature function.
 * Direct usage of this token is only needed for advanced scenarios.
 *
 * @example Using the feature function (recommended)
 * ```typescript
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withEventFormValue()
 * )
 * ```
 *
 * @example Direct token usage (advanced)
 * ```typescript
 * providers: [
 *   { provide: EMIT_FORM_VALUE_ON_EVENTS, useValue: true }
 * ]
 * ```
 *
 * Per-form overrides can be set via `options.emitFormValueOnEvents` in the form config.
 *
 * @public
 */
export const EMIT_FORM_VALUE_ON_EVENTS = new InjectionToken<boolean>('EMIT_FORM_VALUE_ON_EVENTS', {
  providedIn: 'root',
  factory: () => false,
});
