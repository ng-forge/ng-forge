import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Apply OR Conditional Logic for Multiple Conditions
 */
@Component({
  selector: 'example-or-logic-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" data-testid="or-logic-test">
        <h2>Apply OR Conditional Logic for Multiple Conditions</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-or-logic-test'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class OrLogicTestComponent {
  config = {
    fields: [
      {
        key: 'isStudent',
        type: 'checkbox',
        label: 'I am a student',
        col: 6,
      },
      {
        key: 'isSenior',
        type: 'checkbox',
        label: 'I am a senior (65+)',
        col: 6,
      },
      {
        key: 'discountInfo',
        type: 'input',
        label: 'Discount Information',
        value: 'You qualify for a discount!',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'or',
              conditions: [
                {
                  type: 'fieldValue',
                  fieldPath: 'isStudent',
                  operator: 'equals',
                  value: true,
                },
                {
                  type: 'fieldValue',
                  fieldPath: 'isSenior',
                  operator: 'equals',
                  value: true,
                },
              ],
            },
          },
        ],
        col: 12,
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
        props: {
          type: 'submit',
          color: 'primary',
        },
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
      testId: 'or-logic-test',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
