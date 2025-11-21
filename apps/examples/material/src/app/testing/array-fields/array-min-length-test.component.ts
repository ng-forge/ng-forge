import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AddArrayItemEvent, DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

class AddItemsEvent extends AddArrayItemEvent {
  constructor() {
    super('items', {
      key: 'item',
      type: 'input',
      label: 'Item',
    });
  }
}

/**
 * Array Min Length Test Component
 * Tests minimum length constraint on array fields
 */
@Component({
  selector: 'example-array-min-length-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Minimum Length</h1>
      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <p class="scenario-description">{{ description }}</p>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />
        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
})
export class ArrayMinLengthTestComponent {
  testId = 'array-min-length';
  title = 'Minimum Length';
  description = 'Test minimum length constraint on array fields';
  config = {
    fields: [
      {
        key: 'items',
        type: 'array',
        label: 'Items',
        // minLength: 2,
        fields: [
          {
            key: 'item',
            type: 'input',
            label: 'Item',
          },
        ],
      },
      {
        key: 'addItemButton',
        type: 'button',
        label: 'Add Item',
        className: 'array-add-button',
        event: AddItemsEvent,
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig;
  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    const submission = { timestamp: new Date().toISOString(), testId: this.testId, data: value };
    this.submissionLog.update((log) => [...log, submission]);
    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
