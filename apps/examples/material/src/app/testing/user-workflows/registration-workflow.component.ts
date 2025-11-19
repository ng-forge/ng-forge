import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Registration Workflow Test Component
 * Tests user registration form with validation
 */
@Component({
  selector: 'app-registration-workflow',
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
  styleUrl: '../test-component.styles.scss',
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
  };

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
