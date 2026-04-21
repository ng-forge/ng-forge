import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, EventDispatcher, FormConfig, arrayEvent } from '@ng-forge/dynamic-forms';

const config = {
  fields: [
    {
      key: 'items',
      type: 'array',
      fields: [
        [{ key: 'value', type: 'input', label: 'Name', value: 'Alpha' }],
        [{ key: 'value', type: 'input', label: 'Email', value: 'Beta' }],
        [{ key: 'value', type: 'input', label: 'Phone', value: 'Gamma' }],
      ],
    },
  ],
} as const satisfies FormConfig;

/**
 * E2E test component for array move operations.
 * Dispatches move events via EventDispatcher to reorder array items.
 */
@Component({
  selector: 'bs-example-array-move',
  imports: [DynamicForm, JsonPipe],
  providers: [EventDispatcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page">
      <h1>Array Move</h1>
      <section class="test-scenario" data-testid="array-move">
        <form [dynamic-form]="config" [(value)]="formValue"></form>
        <div class="move-buttons">
          <button data-testid="move-first-to-last" (click)="moveFirstToLast()">Move First to Last</button>
          <button data-testid="move-last-to-first" (click)="moveLastToFirst()">Move Last to First</button>
          <button data-testid="remove-last" (click)="removeLast()">Remove Last</button>
          <button data-testid="add-item" (click)="addItem()">Add Item</button>
        </div>
        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre data-testid="form-value-array-move">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
})
export class ArrayMoveComponent {
  protected readonly config = config;
  readonly formValue = signal<Record<string, unknown>>({});

  private readonly dispatcher = inject(EventDispatcher);

  moveFirstToLast(): void {
    this.dispatcher.dispatch(arrayEvent('items').move(0, 2));
  }

  moveLastToFirst(): void {
    this.dispatcher.dispatch(arrayEvent('items').move(2, 0));
  }

  removeLast(): void {
    this.dispatcher.dispatch(arrayEvent('items').pop());
  }

  addItem(): void {
    this.dispatcher.dispatch(arrayEvent('items').append([{ key: 'value', type: 'input', label: 'Note', value: 'Delta' }]));
  }
}
