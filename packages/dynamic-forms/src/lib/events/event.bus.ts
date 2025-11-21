import { Injectable } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { FormEvent, FormEventConstructor } from './interfaces/form-event';

/**
 * Event bus service for form-wide event communication.
 *
 * Provides type-safe event dispatching and subscription for form components
 * to communicate without direct coupling. Uses RxJS observables for reactive
 * event handling and supports both single event type and multiple event type subscriptions.
 *
 * @example
 * ```typescript
 * @Component({
 *   providers: [EventBus]
 * })
 * export class MyFormComponent {
 *   constructor(private eventBus: EventBus) {
 *     // Subscribe to form submission events
 *     this.eventBus.on(SubmitEvent).subscribe(() => {
 *       console.log('Form was submitted');
 *     });
 *
 *     // Subscribe to multiple event types
 *     this.eventBus.on([SubmitEvent, ResetEvent]).subscribe(event => {
 *       console.log('Form event:', event.type);
 *     });
 *   }
 *
 *   onSubmit() {
 *     // Dispatch a submit event
 *     this.eventBus.dispatch(SubmitEvent);
 *   }
 * }
 * ```
 */
@Injectable()
export class EventBus {
  private pipeline$ = new Subject<FormEvent>();

  events$ = this.pipeline$.asObservable();

  /**
   * Dispatches an event to all subscribers.
   *
   * Creates an instance of the provided event constructor and broadcasts it
   * through the event pipeline to all active subscribers.
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
  dispatch<T extends FormEventConstructor>(eventConstructor: T, ...args: any[]): void {
    this.pipeline$.next(new eventConstructor(...args));
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
   * eventBus.on(SubmitEvent).subscribe(event => {
   *   console.log('Submit event received');
   * });
   *
   * // Subscribe to multiple event types
   * eventBus.subscribe(['submit', 'reset', 'validation-error']).subscribe(event => {
   *   switch (event.type) {
   *     case 'submit':
   *       handleSubmit();
   *       break;
   *     case 'reset':
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
