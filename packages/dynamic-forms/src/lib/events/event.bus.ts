import { inject, Injectable, InjectionToken, Signal, Type } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { FormEvent, FormEventConstructor } from './interfaces/form-event';
import { EMIT_FORM_VALUE_ON_EVENTS } from '../providers/features/event-form-value/emit-form-value.token';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { FORM_OPTIONS } from '../models/field-signal-context.token';
import { FormOptions } from '../models/form-config';

/**
 * Safely attempts to inject a dependency using an InjectionToken.
 * Returns the default value if called outside an injection context.
 */
function safeInjectToken<T>(token: InjectionToken<T>, defaultValue: T): T {
  try {
    return inject(token, { optional: true }) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely attempts to inject a service class.
 * Returns the default value if called outside an injection context.
 */
function safeInjectClass<T>(token: Type<T>, defaultValue: T | null): T | null {
  try {
    return inject(token, { optional: true }) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Creates a copy of an event with an additional formValue property.
 * Preserves the event's prototype chain so instanceof checks still work.
 */
function attachFormValue<T extends FormEvent>(event: T, formValue: Record<string, unknown>): T & { formValue: unknown } {
  const prototype = Object.getPrototypeOf(event);
  return Object.assign(Object.create(prototype), event, { formValue });
}

/**
 * Event bus for form-wide event communication between field components.
 *
 * **Intended for use inside DynamicForm** — i.e. within custom field components,
 * field mappers, or other services that live inside the form's component injector.
 * Inject it directly to dispatch or observe events from within a field:
 *
 * ```typescript
 * // Inside a custom field component
 * export class MyFieldComponent {
 *   private readonly eventBus = inject(EventBus);
 *
 *   onAction() {
 *     this.eventBus.dispatch(arrayEvent('items').append(template));
 *   }
 * }
 * ```
 *
 * **If you are outside DynamicForm** (e.g. in a host component or a service that wraps
 * the form), use {@link EventDispatcher} instead. Injecting `EventBus` in a parent
 * component gives you a *different instance* that the form knows nothing about.
 *
 * `EventBus` is scoped to each `DynamicForm` instance via `provideDynamicFormDI()`.
 * It provides type-safe dispatching and RxJS-based subscription for all form events.
 *
 * @see EventDispatcher — for dispatching events from outside the form
 */
@Injectable()
export class EventBus {
  private readonly pipeline$ = new Subject<FormEvent>();
  private readonly globalEmitFormValue = safeInjectToken(EMIT_FORM_VALUE_ON_EVENTS, false);
  private readonly rootFormRegistry = safeInjectClass(RootFormRegistryService, null);
  private readonly formOptions = safeInjectToken<Signal<FormOptions | undefined> | null>(FORM_OPTIONS, null);

  events$ = this.pipeline$.asObservable();

  /**
   * Dispatches an event to all subscribers.
   *
   * Creates an instance of the provided event constructor and broadcasts it
   * through the event pipeline to all active subscribers.
   *
   * If `withEventFormValue()` is enabled globally or `options.emitFormValueOnEvents`
   * is set to `true` in the form config, the current form value will be attached
   * to the event's `formValue` property.
   *
   * @param eventConstructor - Constructor function for the event to dispatch
   *
   * @example
   * ```typescript
   * // Dispatch a submit event
   * eventBus.dispatch(SubmitEvent);
   *
   * // Dispatch a custom event
   * eventBus.dispatch(CustomFormEvent);
   * ```
   */
  // TypeScript limitation: Must use ConstructorParameters which relies on `any` in FormEventConstructor
  dispatch<T extends FormEventConstructor>(eventConstructor: T, ...args: ConstructorParameters<T>): void {
    const event = new eventConstructor(...args);

    if (this.shouldEmitFormValue()) {
      const formValue = this.rootFormRegistry?.formValue();
      // Only attach if form value exists and has at least one field.
      // Empty objects {} are not attached - use hasFormValue() to check.
      if (formValue && Object.keys(formValue).length > 0) {
        this.pipeline$.next(attachFormValue(event, formValue));
        return;
      }
    }

    this.pipeline$.next(event);
  }

  /**
   * Dispatches a pre-created event instance directly.
   * Used internally by DynamicFormDispatcher to forward events into the bus.
   * @internal
   */
  emitInstance(event: FormEvent): void {
    if (this.shouldEmitFormValue()) {
      const formValue = this.rootFormRegistry?.formValue();
      if (formValue && Object.keys(formValue).length > 0) {
        this.pipeline$.next(attachFormValue(event, formValue));
        return;
      }
    }
    this.pipeline$.next(event);
  }

  /**
   * Determines whether form value should be attached to events.
   *
   * Precedence rules:
   * 1. Per-form setting (if defined) takes precedence
   * 2. Falls back to global setting
   */
  private shouldEmitFormValue(): boolean {
    const formLevelSetting = this.formOptions?.()?.emitFormValueOnEvents;
    return formLevelSetting ?? this.globalEmitFormValue;
  }

  /**
   * Subscribes to events of a specific type.
   *
   * @param eventType - The type of event to subscribe to
   * @returns Observable that emits events of the specified type
   */
  on<T extends FormEvent>(eventType: T['type']): Observable<T>;
  /**
   * Subscribes to events of multiple types.
   *
   * @param eventType - Array of event types to subscribe to
   * @returns Observable that emits events matching any of the specified types
   */
  on<T extends FormEvent>(eventType: Array<T['type']>): Observable<T>;
  /**
   * Subscribes to form events with type-safe filtering.
   *
   * Provides a reactive stream of events filtered by type. Supports both single
   * event type subscriptions and multi-type subscriptions for flexible event handling.
   *
   * @param eventType - Event type string or array of event type strings to filter by
   * @returns Observable stream of filtered events
   *
   * @example
   * ```typescript
   * // Subscribe to a single event type
   * eventBus.on<SubmitEvent>('submit').subscribe(event => {
   *   console.log('Submit event received');
   * });
   *
   * // Subscribe to multiple event types
   * eventBus.on<SubmitEvent | FormResetEvent | ValidationErrorEvent>(['submit', 'form-reset', 'validation-error']).subscribe(event => {
   *   switch (event.type) {
   *     case 'submit':
   *       handleSubmit();
   *       break;
   *     case 'form-reset':
   *       handleReset();
   *       break;
   *     case 'validation-error':
   *       handleValidationError();
   *       break;
   *   }
   * });
   * ```
   */
  on<T extends FormEvent>(eventType: T['type'] | Array<T['type']>): Observable<T> {
    if (Array.isArray(eventType)) {
      return this.pipeline$.pipe(filter((event): event is T => eventType.includes(event.type)));
    }

    return this.pipeline$.pipe(filter((event): event is T => event.type === eventType));
  }
}
