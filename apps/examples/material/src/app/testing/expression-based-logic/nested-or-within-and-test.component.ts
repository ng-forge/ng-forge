import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Handle Nested OR within AND Conditions
 */
@Component({
  selector: 'example-nested-or-within-and-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" data-testid="nested-or-within-and-test">
        <h2>Handle Nested OR within AND Conditions</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-nested-or-within-and-test'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class NestedOrWithinAndTestComponent {
  config = {
    fields: [
      {
        key: 'isPaid',
        type: 'checkbox',
        label: 'I have a paid account',
        col: 6,
      },
      {
        key: 'isTrial',
        type: 'checkbox',
        label: 'I am on a trial',
        col: 6,
      },
      {
        key: 'isVerified',
        type: 'checkbox',
        label: 'My account is verified',
        col: 6,
      },
      {
        key: 'isAdmin',
        type: 'checkbox',
        label: 'I am an admin',
        col: 6,
      },
      {
        key: 'premiumFeatures',
        type: 'input',
        label: 'Premium Features',
        value: 'Access to all premium features!',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'and',
              conditions: [
                {
                  type: 'or',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'isPaid',
                      operator: 'equals',
                      value: true,
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'isTrial',
                      operator: 'equals',
                      value: true,
                    },
                  ],
                },
                {
                  type: 'or',
                  conditions: [
                    {
                      type: 'fieldValue',
                      fieldPath: 'isVerified',
                      operator: 'equals',
                      value: true,
                    },
                    {
                      type: 'fieldValue',
                      fieldPath: 'isAdmin',
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
      testId: 'nested-or-within-and-test',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
