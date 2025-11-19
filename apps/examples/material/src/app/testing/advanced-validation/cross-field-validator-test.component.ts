import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Cross-Field Validator Test Component
 * Tests password matching validation across fields
 */
@Component({
  selector: 'example-cross-field-validator-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-component.styles.scss',
  template: `
    <div class="test-page">
      <h1>Cross-Field Validation Test</h1>
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
export class CrossFieldValidatorTestComponent {
  testId = 'cross-field-test';
  title = 'Cross-Field Validation Test';
  description = 'Passwords must match between password and confirm password fields';

  config: FormConfig = {
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
        col: 6,
      },
      {
        key: 'confirmPassword',
        type: 'input',
        label: 'Confirm Password',
        props: {
          type: 'password',
        },
        required: true,
        validators: [
          {
            type: 'custom',
            name: 'passwordMatch',
            message: 'Passwords must match',
          },
        ],
        col: 6,
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
