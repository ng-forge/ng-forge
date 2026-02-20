import { Injectable } from '@angular/core';
import { EventBus } from '../events/event.bus';
import { FormEvent } from '../events/interfaces/form-event';

/**
 * Injectable service for dispatching events into a DynamicForm from outside the form.
 *
 * ## When to use
 *
 * Use `EventDispatcher` when you need to drive form behaviour **from the host component** —
 * for example, appending array items in response to a field value change, triggering a form
 * reset from a toolbar button, or reacting to external application state.
 *
 * This is the recommended alternative to accessing the form's internals via `viewChild`.
 *
 * ## Setup
 *
 * Provide `EventDispatcher` at the **host component** level (not root). DynamicForm
 * automatically detects it and connects its internal event bus to the dispatcher.
 *
 * ```typescript
 * @Component({
 *   providers: [EventDispatcher],
 *   template: `<form [dynamic-form]="config" [(value)]="formValue"></form>`
 * })
 * export class MyComponent {
 *   readonly dispatcher = inject(EventDispatcher);
 *   readonly formValue = signal<Record<string, unknown>>({});
 *
 *   constructor() {
 *     effect(() => {
 *       const category = this.formValue()?.['category'] as string | undefined;
 *       if (category) {
 *         this.dispatcher.dispatch(
 *           arrayEvent('tasks').append([{ key: 'name', type: 'input', label: 'Task', value: category }])
 *         );
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * ## Multi-form note
 *
 * If multiple `DynamicForm` instances exist under the same provider scope, **all forms**
 * will receive dispatched events. To target a specific form, scope the provider to a
 * wrapper component that contains only that form.
 *
 * ## What events can be dispatched
 *
 * Any `FormEvent` instance is accepted — array events, reset/clear events, custom events, etc.
 * The `arrayEvent()` builder is the recommended way to construct array manipulation events:
 *
 * ```typescript
 * dispatcher.dispatch(arrayEvent('tasks').append(template));
 * dispatcher.dispatch(arrayEvent('tasks').removeAt(0));
 * dispatcher.dispatch(new FormResetEvent());
 * ```
 */
@Injectable()
export class EventDispatcher {
  private bus: EventBus | undefined;

  /**
   * Dispatches a form event into the connected DynamicForm's event bus.
   * No-op if no form is currently connected.
   *
   * @param event - A FormEvent instance. Use the `arrayEvent()` builder for array operations.
   */
  dispatch(event: FormEvent): void {
    this.bus?.emitInstance(event);
  }

  /** @internal - Called by DynamicForm on init */
  connect(bus: EventBus): void {
    this.bus = bus;
  }

  /** @internal - Called by DynamicForm on destroy */
  disconnect(): void {
    this.bus = undefined;
  }
}
