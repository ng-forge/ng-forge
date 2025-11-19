import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-form';

/**
 * Cross-Field Validation Scenario Component
 * Tests validation across multiple fields (email/password/confirmPassword)
 */
@Component({
  selector: 'example-cross-field-validation-scenario',
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
export class CrossFieldValidationScenarioComponent {
  testId = 'cross-field-validation';
  title = 'Cross-Field Validation';

  config = {
    fields: [
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        props: {
          type: 'email',
          placeholder: 'Enter email',
        },
        email: true,
        required: true,
      },
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
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
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
