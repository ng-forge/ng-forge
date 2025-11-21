import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Cross-Field Validation Scenario Component
 * Test scenario for validating fields in relation to other fields
 */
@Component({
  selector: 'example-cross-field-validation-scenario',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" [attr.data-testid]="testId">
      <h2>{{ title }}</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-styles.scss',
})
export class CrossFieldValidationScenarioComponent {
  testId = 'cross-field-validation-scenario';
  title = 'Cross-Field Validation';

  config = {
    fields: [
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        props: { type: 'password' },
        required: true,
        minLength: 8,
      },
      {
        key: 'confirmPassword',
        type: 'input',
        label: 'Confirm Password',
        props: { type: 'password' },
        required: true,
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: this.testId,
      data: value,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
