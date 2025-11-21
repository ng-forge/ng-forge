import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Password Confirmation Validation Test Component
 * Tests cross-field validation with password matching
 */
@Component({
  selector: 'example-password-validation-test',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <div class="test-scenario" data-testid="password-validation">
        <h2>Password Confirmation Validation</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output form-state">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-password-validation'">{{ value() | json }}</pre>
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
export class PasswordValidationTestComponent {
  value = signal<Record<string, unknown>>({});
  submissions = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  config = {
    fields: [
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        props: {
          type: 'password',
          placeholder: 'Enter password',
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
          placeholder: 'Confirm password',
        },
        required: true,
        col: 6,
        validators: [
          {
            type: 'custom',
            functionName: 'passwordMatch',
          },
        ],
        validationMessages: {
          custom: 'Passwords must match',
        },
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        props: {
          type: 'email',
          placeholder: 'Enter email',
        },
        email: true,
        required: true,
        col: 12,
      },
      {
        key: 'submitPassword',
        type: 'submit',
        label: 'Create Account',
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
        detail: { testId: 'password-validation', ...submission },
      }),
    );
  }
}
