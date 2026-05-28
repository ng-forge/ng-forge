import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { EMIT_FORM_VALUE_ON_EVENTS } from './emit-form-value.token';

/**
 * Enables automatic form value attachment to all events dispatched through the EventBus.
 *
 * @remarks
 * **Precedence rules:**
 * 1. Per-form `false` - Disables for this form, regardless of global setting
 * 2. Per-form `true` - Enables for this form, regardless of global setting
 * 3. Per-form `undefined` - Uses global setting
 * 4. Global `withEventFormValue()` - Enables globally
 * 5. No global feature - Disabled globally (default)
 * @returns A DynamicFormFeature that enables form value attachment to events
 */
export function withEventFormValue(): DynamicFormFeature<'event-form-value'> {
  return createFeature('event-form-value', [{ provide: EMIT_FORM_VALUE_ON_EVENTS, useValue: true }]);
}
