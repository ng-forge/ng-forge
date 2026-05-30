import { inject, Injectable, InjectionToken, Signal, Type } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { FormEvent, FormEventConstructor } from './interfaces/form-event';
import { EMIT_FORM_VALUE_ON_EVENTS } from '../providers/features/event-form-value/emit-form-value.token';
import { RootFormRegistryService } from '@ng-forge/dynamic-forms/internal';
import { FORM_OPTIONS } from '@ng-forge/dynamic-forms/internal';
import { FormOptions } from '@ng-forge/dynamic-forms/internal';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import type { Logger } from '@ng-forge/dynamic-forms/internal';
import { NoopLogger } from '../providers/features/logger/noop-logger';

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
 * @see EventDispatcher — for dispatching events from outside the form
 */

const FALLBACK_LOGGER = new NoopLogger();

@Injectable()
export class EventBus {
  private readonly pipeline$ = new Subject<FormEvent>();
  private readonly globalEmitFormValue = safeInjectToken(EMIT_FORM_VALUE_ON_EVENTS, false);
  private readonly rootFormRegistry = safeInjectClass(RootFormRegistryService, null);
  private readonly formOptions = safeInjectToken<Signal<FormOptions | undefined> | null>(FORM_OPTIONS, null);
  private readonly logger = safeInjectToken<Logger>(DynamicFormLogger, FALLBACK_LOGGER);

  events$ = this.pipeline$.asObservable();

  /**
   * Dispatches a pre-created event instance directly.
   *
   * @param event - A FormEvent instance to dispatch
   */
  dispatch(event: FormEvent): void;
  /**
   * Dispatches an event to all subscribers by instantiating the provided constructor.
   *
   * @param eventConstructor - Constructor function for the event to dispatch
   * @param args - Arguments to pass to the event constructor
   */
  // TypeScript limitation: Must use ConstructorParameters which relies on `any` in FormEventConstructor
  dispatch<T extends FormEventConstructor>(eventConstructor: T, ...args: ConstructorParameters<T>): void;
  dispatch<T extends FormEventConstructor>(eventOrConstructor: FormEvent | T, ...args: ConstructorParameters<T>): void {
    if (typeof eventOrConstructor !== 'function' && 'type' in eventOrConstructor) {
      this.emit(eventOrConstructor);
    } else {
      this.emit(new (eventOrConstructor as T)(...args));
    }
  }

  /**
   * Dispatches a pre-created event instance directly.
   * Used internally by EventDispatcher to forward events into the bus.
   *
   * @internal
   */
  emitInstance(event: FormEvent): void {
    this.emit(event);
  }

  /**
   * Shared emit path for both dispatch() and emitInstance().
   * Attaches form value if configured, then pushes to the pipeline.
   */
  private emit(event: FormEvent): void {
    if (this.shouldEmitFormValue()) {
      const formValue = this.rootFormRegistry?.formValue();
      // Only attach if form value exists and has at least one field.
      // Empty objects {} are not attached - use hasFormValue() to check.
      if (formValue && Object.keys(formValue).length > 0) {
        this.safeEmit(attachFormValue(event, formValue));
        return;
      }
    }

    this.safeEmit(event);
  }

  /**
   * Emits an event through the pipeline. Catches any synchronous exception that escapes
   * RxJS's own error handling so dispatch() callers are never disrupted by a failing subscriber.
   */
  private safeEmit(event: FormEvent): void {
    try {
      this.pipeline$.next(event);
    } catch (err: unknown) {
      this.logger.error('Exception in EventBus subscriber during dispatch', err);
    }
  }

  /** Determines whether form value should be attached to events. */
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
   * @param eventType - Event type string or array of event type strings to filter by
   * @returns Observable stream of filtered events
   */
  on<T extends FormEvent>(eventType: T['type'] | Array<T['type']>): Observable<T> {
    if (Array.isArray(eventType)) {
      return this.pipeline$.pipe(filter((event): event is T => eventType.includes(event.type)));
    }

    return this.pipeline$.pipe(filter((event): event is T => event.type === eventType));
  }
}
