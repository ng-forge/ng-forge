import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Age-Based Logic Test Component
 * Tests conditional field visibility based on age value
 */
@Component({
  selector: 'example-age-based-logic-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Age-Based Logic</h1>

      <section class="test-scenario" data-testid="age-based-logic">
        <h2>Age-Based Logic</h2>
        <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-age-based-logic'">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class AgeBasedLogicTestComponent {
  config = {
    fields: [
      {
        key: 'age',
        type: 'input',
        label: 'Age',
        required: true,
        props: {
          type: 'number',
        },
      },
      {
        key: 'guardianConsent',
        type: 'checkbox',
        label: 'Guardian Consent Required',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'age',
              operator: 'greaterOrEqual',
              value: 18,
            },
          },
        ],
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig;

  formValue = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: { ...submission, testId: 'age-based-logic' } }));
  }
}
