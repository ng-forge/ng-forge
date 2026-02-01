import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { EMIT_FORM_VALUE_ON_EVENTS } from './emit-form-value.token';

/**
 * Enables automatic form value attachment to all events dispatched through the EventBus.
 *
 * When this feature is enabled, events dispatched via `eventBus.dispatch()` will include
 * the current form value in the `formValue` property. This is useful for event handlers
 * that need access to the complete form state at the time of the event.
 *
 * @example Global opt-in
 * ```typescript
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withEventFormValue()
 * )
 * ```
 *
 * @example Consumer usage
 * ```typescript
 * eventBus.on<SubmitEvent>('submit').subscribe(event => {
 *   if (hasFormValue(event)) {
 *     console.log('Form value:', event.formValue);
 *   }
 * });
 * ```
 *
 * @example Per-form disable (when globally enabled)
 * ```typescript
 * const config: FormConfig = {
 *   fields: [...],
 *   options: { emitFormValueOnEvents: false }
 * };
 * ```
 *
 * @remarks
 * **Precedence rules:**
 * 1. Per-form `false` - Disables for this form, regardless of global setting
 * 2. Per-form `true` - Enables for this form, regardless of global setting
 * 3. Per-form `undefined` - Uses global setting
 * 4. Global `withEventFormValue()` - Enables globally
 * 5. No global feature - Disabled globally (default)
 *
 * @returns A DynamicFormFeature that enables form value attachment to events
 *
 * @public
 */
export function withEventFormValue(): DynamicFormFeature<'event-form-value'> {
  return createFeature('event-form-value', [{ provide: EMIT_FORM_VALUE_ON_EVENTS, useValue: true }]);
}
