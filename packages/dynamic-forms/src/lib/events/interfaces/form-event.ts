/** Base interface for all form events in the dynamic form system. */
export interface FormEvent {
  /** Unique identifier for the event type used for filtering and subscriptions */
  readonly type: string;
  /**
   * Optional form value attached to the event when `withEventFormValue()` is enabled
   * or `options.emitFormValueOnEvents` is set to `true` in the form config.
   */
  readonly formValue?: unknown;
}

/**
 * Type guard to check if a form event has a form value attached.
 *
 * @param event - The form event to check
 * @returns `true` if the event has a form value attached, narrowing the type
 */
export function hasFormValue<T extends FormEvent>(event: T): event is T & { formValue: unknown } {
  return 'formValue' in event && event.formValue !== undefined;
}

/**
 * Constructor type for form event classes.
 *
 * @typeParam T - The form event type being constructed
 */
// TypeScript limitation: Constructor types with varying parameter signatures require `any[]`
// because `unknown[]` cannot be assigned from more specific parameter types (contravariance).
// Using a generic TArgs parameter here would require changes throughout the event system.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormEventConstructor<T extends FormEvent = FormEvent> = new (...args: any[]) => T;
