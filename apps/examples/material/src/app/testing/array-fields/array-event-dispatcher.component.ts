import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, EventDispatcher, FormConfig, arrayEvent } from '@ng-forge/dynamic-forms';

const config = {
  fields: [
    {
      key: 'categories',
      type: 'multi-checkbox',
      label: 'Categories',
      options: [
        { value: 'bug', label: 'Bug' },
        { value: 'feature', label: 'Feature' },
        { value: 'chore', label: 'Chore' },
      ],
    },
    {
      key: 'tasks',
      type: 'array',
      fields: [],
    },
  ],
} as const satisfies FormConfig;

/**
 * E2E host for EventDispatcher. Appends a task item whenever a new category
 * is checked — without viewChild or accessing form internals.
 */
@Component({
  selector: 'example-array-event-dispatcher',
  imports: [DynamicForm, JsonPipe],
  providers: [EventDispatcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page">
      <h1>EventDispatcher</h1>
      <section class="test-scenario" data-testid="array-event-dispatcher">
        <p>Check a category — a task item is appended via EventDispatcher.</p>
        <form [dynamic-form]="config" [(value)]="formValue"></form>
        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-array-event-dispatcher'">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
})
export class ArrayEventDispatcherComponent {
  protected readonly config = config;
  readonly formValue = signal<Record<string, unknown>>({});

  private readonly dispatcher = inject(EventDispatcher);
  private prevCategories: string[] = [];

  constructor() {
    effect(() => {
      const raw = this.formValue()?.['categories'];
      const categories = Array.isArray(raw) ? (raw as string[]) : [];
      const added = categories.filter((c) => !this.prevCategories.includes(c));

      for (const category of added) {
        this.dispatcher.dispatch(arrayEvent('tasks').append([{ key: 'name', type: 'input', label: 'Task Name', value: category }]));
      }

      this.prevCategories = [...categories];
    });
  }
}
