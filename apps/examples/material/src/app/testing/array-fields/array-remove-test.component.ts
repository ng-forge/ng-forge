import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, RemoveArrayItemEvent } from '@ng-forge/dynamic-forms';

class RemovePhonesEvent extends RemoveArrayItemEvent {
  constructor() {
    super('phones');
  }
}

/**
 * Array Remove Test Component
 * Tests removing items from array fields
 */
@Component({
  selector: 'example-array-remove-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Remove Array Items</h1>
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
export class ArrayRemoveTestComponent {
  testId = 'array-remove';
  title = 'Remove Array Items';
  description = 'Remove phone numbers from the array field';
  config = {
    fields: [
      {
        key: 'phones',
        type: 'array',
        fields: [
          {
            key: 'phone',
            type: 'input',
            label: 'Phone',
          },
        ],
      },
      {
        key: 'removePhoneButton',
        type: 'removeArrayItem',
        label: 'Remove',
        className: 'array-remove-button',
      },
    ],
  } as const satisfies FormConfig;
  value = signal<Record<string, unknown>>({
    phones: [{ phone: '555-0001' }, { phone: '555-0002' }],
  });
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    const submission = { timestamp: new Date().toISOString(), testId: this.testId, data: value };
    this.submissionLog.update((log) => [...log, submission]);
    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
