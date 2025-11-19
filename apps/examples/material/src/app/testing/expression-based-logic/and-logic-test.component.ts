import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Hide Fields Using AND Conditional Logic
 */
@Component({
  selector: 'app-and-logic-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" data-testid="and-logic-test">
        <h2>Hide Fields Using AND Conditional Logic</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-and-logic-test'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class AndLogicTestComponent {
  config = {
    fields: [
      {
        key: 'hasDiscount',
        type: 'checkbox',
        label: 'I have a discount code',
        col: 6,
      },
      {
        key: 'isPremiumMember',
        type: 'checkbox',
        label: 'I am a premium member',
        col: 6,
      },
      {
        key: 'regularPrice',
        type: 'input',
        label: 'Regular Price Display',
        value: '$99.99',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'and',
              conditions: [
                {
                  type: 'fieldValue',
                  fieldPath: 'hasDiscount',
                  operator: 'equals',
                  value: true,
                },
                {
                  type: 'fieldValue',
                  fieldPath: 'isPremiumMember',
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
        type: 'button',
        label: 'Submit',
        props: {
          type: 'submit',
          color: 'primary',
        },
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
      testId: 'and-logic-test',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
