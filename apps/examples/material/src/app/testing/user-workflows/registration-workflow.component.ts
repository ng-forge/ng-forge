import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Registration Workflow Test Component
 * Tests user registration form with validation
 */
@Component({
  selector: 'example-registration-workflow',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" data-testid="registration-workflow">
        <h2>User Registration Workflow</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-registration-workflow'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class RegistrationWorkflowComponent {
  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        required: true,
        col: 6,
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        required: true,
        col: 6,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
        email: true,
        props: {
          type: 'email',
        },
      },
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        required: true,
        minLength: 8,
        props: {
          type: 'password',
        },
        col: 6,
      },
      {
        key: 'confirmPassword',
        type: 'input',
        label: 'Confirm Password',
        required: true,
        minLength: 8,
        props: {
          type: 'password',
        },
        col: 6,
      },
      {
        key: 'agreeTerms',
        type: 'checkbox',
        label: 'I agree to the terms and conditions',
        required: true,
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Register',
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});

  onSubmitted(formValue: Record<string, unknown> | undefined): void {
    if (!formValue) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'registration-workflow',
      data: formValue,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
