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
