import { FormEvent } from '../interfaces/form-event';

/**
 * Event dispatched when the form should be reset to its default values.
 *
 * This event instructs the dynamic form component to restore all field values
 * to their initial default values as defined in the form configuration.
 *
 * @example
 * ```typescript
 * // Dispatch from a button component
 * eventBus.dispatch(FormResetEvent);
 * ```
 *
 * @example
 * ```typescript
 * // Listen for reset events
 * eventBus.on<FormResetEvent>('form-reset').subscribe(() => {
 *   console.log('Form was reset to defaults');
 * });
 * ```
 */
export class FormResetEvent implements FormEvent {
  readonly type = 'form-reset' as const;
}
