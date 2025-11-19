import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Validation Testing Component
 * Tests various field validations and error handling
 */
@Component({
  selector: 'app-validation-test',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Validation Testing</h1>
      <section class="test-scenario" data-testid="validation-test">
        <h2 data-testid="validation-test-title">Validation Testing</h2>
        <p class="scenario-description">Testing various field validations and error handling</p>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output form-state">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-validation-test'">{{ value() | json }}</pre>
          @if (submissions().length > 0) {
            <div class="submissions">
              <strong>Submissions:</strong>
              @for (sub of submissions(); track sub.timestamp; let i = $index) {
                <div [attr.data-testid]="'submission-' + i">{{ sub.timestamp }}: {{ sub.data | json }}</div>
              }
            </div>
          }
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class ValidationTestComponent {
  value = signal<Record<string, unknown>>({});
  submissions = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  config = {
    fields: [
      // Required text field
      {
        key: 'requiredText',
        type: 'input',
        label: 'Required Text (minimum 5 characters)',
        props: {
          placeholder: 'Enter at least 5 characters',
        },
        required: true,
        minLength: 5,
        col: 12,
      },
      // Email validation
      {
        key: 'emailValidation',
        type: 'input',
        label: 'Email Validation',
        props: {
          type: 'email',
          placeholder: 'Enter valid email',
        },
        email: true,
        required: true,
        col: 12,
      },
      // Number with range validation
      {
        key: 'numberRange',
        type: 'input',
        label: 'Number (1-100)',
        props: {
          type: 'number',
          placeholder: 'Enter number between 1 and 100',
        },
        min: 1,
        max: 100,
        required: true,
        col: 12,
      },
      // Pattern validation
      {
        key: 'patternValidation',
        type: 'input',
        label: 'Pattern Validation (Only letters and spaces)',
        props: {
          placeholder: 'Only letters and spaces allowed',
        },
        pattern: '^[a-zA-Z\\s]+$',
        required: true,
        col: 12,
      },
      // Submit Button
      {
        key: 'submitValidation',
        type: 'submit',
        label: 'Submit with Validation',
        col: 12,
      },
    ],
  };

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissions.update((subs) => [...subs, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: { ...submission, testId: 'validation-test' } }));
  }
}
