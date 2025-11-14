import { FormEvent } from '../interfaces/form-event';

/**
 * Event dispatched when the form should be cleared.
 *
 * This event instructs the dynamic form component to clear all field values,
 * resetting them to empty/undefined state regardless of their default values.
 *
 * @example
 * ```typescript
 * // Dispatch from a button component
 * eventBus.dispatch(FormClearEvent);
 * ```
 *
 * @example
 * ```typescript
 * // Listen for clear events
 * eventBus.on<FormClearEvent>('form-clear').subscribe(() => {
 *   console.log('Form was cleared');
 * });
 * ```
 */
export class FormClearEvent implements FormEvent {
  readonly type = 'form-clear' as const;
}
