import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Hide/Show Fields Based on fieldValue Condition
 */
@Component({
  selector: 'app-hidden-logic-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" data-testid="hidden-logic-test">
        <h2>Hide/Show Fields Based on fieldValue Condition</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-hidden-logic-test'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class HiddenLogicTestComponent {
  config = {
    fields: [
      {
        key: 'subscriptionType',
        type: 'select',
        label: 'Subscription Type',
        value: '',
        options: [
          { label: 'Free', value: 'free' },
          { label: 'Premium', value: 'premium' },
        ],
        col: 12,
      },
      {
        key: 'paymentMethod',
        type: 'input',
        label: 'Payment Method',
        value: '',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'subscriptionType',
              operator: 'equals',
              value: 'free',
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
      testId: 'hidden-logic-test',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
