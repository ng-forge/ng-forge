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
  styleUrl: '../test-component.styles.scss',
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

  config: FormConfig = {
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
        required: {
          operator: 'equals',
          fieldValue: { field: 'isAdult', value: true },
        },
        validators: [
          {
            type: 'min',
            value: 18,
            message: 'Must be 18 or older',
            when: {
              operator: 'equals',
              fieldValue: { field: 'isAdult', value: true },
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
  };

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
