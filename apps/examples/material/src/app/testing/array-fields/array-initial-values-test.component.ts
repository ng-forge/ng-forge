import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Array Initial Values Test Component
 * Tests rendering array fields with predefined values
 */
@Component({
  selector: 'example-array-initial-values-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Initial Values</h1>
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
export class ArrayInitialValuesTestComponent {
  testId = 'array-initial-values';
  title = 'Initial Values';
  description = 'Display array fields with predefined values';
  config = {
    fields: [
      {
        key: 'contacts',
        type: 'array',
        fields: [
          {
            key: 'contactRow',
            type: 'row',
            fields: [
              {
                key: 'name',
                type: 'input',
                label: 'Name',
                col: 6,
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                col: 6,
              },
            ],
          },
        ],
      },
    ],
  } as const satisfies FormConfig;
  value = signal<Record<string, unknown>>({
    contacts: [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ],
  });
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    const submission = { timestamp: new Date().toISOString(), testId: this.testId, data: value };
    this.submissionLog.update((log) => [...log, submission]);
    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
