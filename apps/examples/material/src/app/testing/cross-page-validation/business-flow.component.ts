import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Business Account Flow Scenario
 * Tests business account creation workflow with multiple pages
 */
@Component({
  selector: 'example-business-flow',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Business Account Flow</h1>

      <section class="test-scenario" data-testid="business-flow">
        <h2>Business Account Flow</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-business-flow'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class BusinessFlowComponent {
  value = signal<Record<string, unknown>>({});

  config = {
    fields: [
      {
        key: 'accountTypePage',
        type: 'page',
        fields: [
          {
            key: 'account-type-title',
            type: 'text',
            label: 'Account Type',
          },
          {
            key: 'accountType',
            type: 'radio',
            label: 'Account Type',
            options: [
              { value: 'individual', label: 'Individual Account' },
              { value: 'business', label: 'Business Account' },
              { value: 'nonprofit', label: 'Non-Profit Organization' },
            ],
            required: true,
            col: 12,
          },
        ],
      },
      {
        key: 'businessPage',
        type: 'page',
        fields: [
          {
            key: 'business-information-page',
            type: 'text',
            label: 'Business Information',
          },
          {
            key: 'businessName',
            type: 'input',
            label: 'Business Name',
            props: {
              placeholder: 'Enter business name',
            },
            required: true,
            col: 12,
          },
          {
            key: 'taxId',
            type: 'input',
            label: 'Tax ID / EIN',
            props: {
              placeholder: 'Format: XX-XXXXXXX',
            },
            pattern: '^[0-9]{2}-[0-9]{7}$',
            required: true,
            col: 12,
          },
        ],
      },
      {
        key: 'finalPage',
        type: 'page',
        fields: [
          {
            key: 'final-page-title',
            type: 'text',
            label: 'Final Confirmation',
          },
          {
            key: 'submitBusiness',
            type: 'submit',
            label: 'Create Business Account',
            col: 12,
          },
        ],
      },
    ],
  } as const satisfies FormConfig;

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'business-flow',
      data: value,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
