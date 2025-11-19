import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Handle Nested AND within OR Conditions
 */
@Component({
  selector: 'example-nested-and-within-or-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" data-testid="nested-and-within-or-test">
        <h2>Handle Nested AND within OR Conditions</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-nested-and-within-or-test'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class NestedAndWithinOrTestComponent {
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
        key: 'hasValidID',
        type: 'checkbox',
        label: 'I have a valid ID',
        col: 12,
      },
      {
        key: 'specialOffer',
        type: 'input',
        label: 'Special Offer Details',
        value: 'You qualify for our special discount program!',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'or',
              conditions: [
                {
                  type: 'and',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'isStudent',
                      operator: 'equals',
                      value: true,
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'hasValidID',
                      operator: 'equals',
                      value: true,
                    },
                  ],
                },
                {
                  type: 'and',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'isSenior',
                      operator: 'equals',
                      value: true,
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'hasValidID',
                      operator: 'equals',
                      value: true,
                    },
                  ],
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
      testId: 'nested-and-within-or-test',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
