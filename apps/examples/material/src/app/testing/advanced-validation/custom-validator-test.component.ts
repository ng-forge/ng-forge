import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Custom Validator Test Component
 * Tests custom password strength validation
 */
@Component({
  selector: 'example-custom-validator-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Custom Validator Test</h1>
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
export class CustomValidatorTestComponent {
  testId = 'custom-validator-test';
  title = 'Custom Validator Test';
  description = 'Password must contain uppercase, lowercase, number and special character';

  config = {
    fields: [
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        props: {
          type: 'password',
        },
        required: true,
        minLength: 8,
        validators: [
          {
            type: 'custom',
            expression:
              'fieldValue && fieldValue.match("[A-Z]") && fieldValue.match("[a-z]") && fieldValue.match("[0-9]") && fieldValue.match("[!@#$%^&*(),.?\\":{}|<>]")',
            kind: 'strongPassword',
          },
        ],
        validationMessages: {
          strongPassword: 'Password must contain uppercase, lowercase, number and special character',
        },
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
