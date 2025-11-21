import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-form';

/**
 * User Registration Scenario Component
 * Tests a standard user registration form with multiple field types
 */
@Component({
  selector: 'example-user-registration-scenario',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
          @if (submissions().length > 0) {
            <div class="submissions">
              <strong>Submissions:</strong>
              @for (sub of submissions(); track sub.timestamp; let idx = $index) {
                <div [attr.data-testid]="'submission-' + idx">{{ sub.timestamp }}: {{ sub.data | json }}</div>
              }
            </div>
          }
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class UserRegistrationScenarioComponent {
  testId = 'user-registration';
  title = 'User Registration';

  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        required: true,
        props: {
          placeholder: 'Enter first name',
        },
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        required: true,
        props: {
          placeholder: 'Enter last name',
        },
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        email: true,
        required: true,
        props: {
          type: 'email',
          placeholder: 'user@example.com',
        },
      },
      {
        key: 'age',
        type: 'input',
        label: 'Age',
        required: true,
        min: 18,
        props: {
          type: 'number',
          placeholder: '18',
        },
      },
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        required: true,
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
        ],
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Create Account',
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});
  submissions = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  onSubmitted(formValue: Record<string, unknown> | undefined): void {
    if (!formValue) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: formValue,
    };

    this.submissions.update((subs) => [...subs, submission]);

    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { testId: this.testId, ...submission },
      }),
    );
  }
}
