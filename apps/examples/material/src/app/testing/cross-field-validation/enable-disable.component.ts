import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Field Enable/Disable Testing Component
 * Tests enabling/disabling fields based on radio selection
 */
@Component({
  selector: 'example-enable-disable-test',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <div class="test-scenario" data-testid="enable-disable">
        <h2>Field Enable/Disable Testing</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output form-state">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-enable-disable'">{{ value() | json }}</pre>
          @if (submissions().length > 0) {
            <div class="submissions">
              <strong>Submissions:</strong>
              @for (sub of submissions(); track sub.timestamp; let idx = $index) {
                <div [attr.data-testid]="'submission-' + idx">{{ sub.timestamp }}: {{ sub.data | json }}</div>
              }
            </div>
          }
        </details>
      </div>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class EnableDisableTestComponent {
  value = signal<Record<string, unknown>>({});
  submissions = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  config = {
    fields: [
      {
        key: 'shippingMethod',
        type: 'radio',
        label: 'Shipping Method',
        options: [
          { value: 'standard', label: 'Standard (5-7 days)' },
          { value: 'express', label: 'Express (2-3 days)' },
          { value: 'overnight', label: 'Overnight' },
          { value: 'pickup', label: 'Store Pickup' },
        ],
        required: true,
        col: 12,
      },
      {
        key: 'shippingAddress',
        type: 'textarea',
        label: 'Shipping Address',
        props: {
          placeholder: 'Enter shipping address',
          rows: 3,
        },
        col: 12,
      },
      {
        key: 'expressInstructions',
        type: 'textarea',
        label: 'Special Delivery Instructions',
        props: {
          placeholder: 'Special instructions for express/overnight delivery',
          rows: 2,
        },
        col: 12,
      },
      {
        key: 'storeLocation',
        type: 'select',
        label: 'Store Pickup Location',
        options: [
          { value: 'downtown', label: 'Downtown Store' },
          { value: 'mall', label: 'Shopping Mall Store' },
          { value: 'airport', label: 'Airport Store' },
        ],
        col: 12,
      },
      {
        key: 'submitEnableDisable',
        type: 'submit',
        label: 'Complete Order',
        col: 12,
      },
    ],
  } as const satisfies FormConfig;

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissions.update((subs) => [...subs, submission]);

    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { testId: 'enable-disable', ...submission },
      }),
    );
  }
}
