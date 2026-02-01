/**
 * Base interface for all form events in the dynamic form system.
 *
 * All form events must implement this interface to be compatible with
 * the event bus system. The type property is used for event filtering
 * and type-safe subscriptions.
 *
 * @example
 * ```typescript
 * export class SubmitEvent implements FormEvent {
 *   readonly type = 'submit';
 * }
 *
 * export class ValidationErrorEvent implements FormEvent {
 *   readonly type = 'validation-error';
 *   constructor(public errors: ValidationErrors) {}
 * }
 * ```
 */
export interface FormEvent {
  /** Unique identifier for the event type used for filtering and subscriptions */
  readonly type: string;
  /**
   * Optional form value attached to the event when `withEventFormValue()` is enabled
   * or `options.emitFormValueOnEvents` is set to `true` in the form config.
   *
   * Use the `hasFormValue()` type guard to check if this property is present.
   */
  readonly formValue?: unknown;
}

/**
 * Type guard to check if a form event has a form value attached.
 *
 * Use this to safely access the `formValue` property on events when
 * `withEventFormValue()` is enabled globally or `options.emitFormValueOnEvents`
 * is set to `true` in the form config.
 *
 * @example
 * ```typescript
 * eventBus.on<SubmitEvent>('submit').subscribe(event => {
 *   if (hasFormValue(event)) {
 *     console.log('Form value:', event.formValue);
 *   }
 * });
 * ```
 *
 * @param event - The form event to check
 * @returns `true` if the event has a form value attached, narrowing the type
 *
 * @public
 */
export function hasFormValue<T extends FormEvent>(event: T): event is T & { formValue: unknown } {
  return 'formValue' in event && event.formValue !== undefined;
}

/**
 * Constructor type for form event classes.
 *
 * Defines the shape of event class constructors that can be used with
 * the event bus dispatch system. Supports both parameterless and
 * parameterized event constructors.
 *
 * @typeParam T - The form event type being constructed
 *
 * @example
 * ```typescript
 * // Parameterless event constructor
 * const SubmitEventCtor: FormEventConstructor<SubmitEvent> = SubmitEvent;
 *
 * // Parameterized event constructor
 * const ErrorEventCtor: FormEventConstructor<ErrorEvent> = ErrorEvent;
 * eventBus.dispatch(ErrorEventCtor);
 * ```
 */
// TypeScript limitation: Constructor types with varying parameter signatures require `any[]`
// because `unknown[]` cannot be assigned from more specific parameter types (contravariance).
// Using a generic TArgs parameter here would require changes throughout the event system.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormEventConstructor<T extends FormEvent = FormEvent> = new (...args: any[]) => T;
