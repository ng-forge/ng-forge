import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * User Registration Scenario Component
 * Test scenario for a user registration form
 */
@Component({
  selector: 'example-user-registration-scenario',
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
export class UserRegistrationScenarioComponent {
  testId = 'user-registration-scenario';
  title = 'User Registration';

  config = {
    fields: [
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        required: true,
        minLength: 3,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        props: { type: 'email' },
        required: true,
        email: true,
      },
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        props: { type: 'password' },
        required: true,
        minLength: 8,
      },
      {
        key: 'agreeToTerms',
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
