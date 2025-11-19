import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Conditional Validator Test Component
 * Tests validators that are conditionally applied based on field values
 */
@Component({
  selector: 'example-conditional-validator-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Conditional Validator Test</h1>
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
export class ConditionalValidatorTestComponent {
  testId = 'conditional-validator-test';
  title = 'Conditional Validator Test';
  description = 'Age field is required and must be 18+ only when "I am 18 or older" checkbox is checked';

  config = {
    fields: [
      {
        key: 'isAdult',
        type: 'checkbox',
        label: 'I am 18 or older',
        col: 12,
      },
      {
        key: 'age',
        type: 'input',
        label: 'Age',
        props: {
          type: 'number',
        },
        logic: [
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              operator: 'equals',
              fieldPath: 'isAdult',
              value: true,
            },
            errorMessage: 'Age is required when you confirm you are 18 or older',
          },
        ],
        validators: [
          {
            type: 'min',
            value: 18,
            errorMessage: 'Must be 18 or older',
            when: {
              type: 'fieldValue',
              operator: 'equals',
              fieldPath: 'isAdult',
              value: true,
            },
          },
        ],
        col: 12,
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
        col: 12,
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: this.testId,
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
