import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Basic Submission Test Component
 * Tests form submission via the submission config action
 */
@Component({
  selector: 'example-basic-submission',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>{{ title }}</h1>

      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <p class="scenario-description">
          Tests form submission using the submission.action configuration. The submit button should be disabled while submitting.
        </p>

        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        @if (isSubmitting()) {
          <div class="submission-status" data-testid="submitting-indicator">Submitting...</div>
        }

        @if (submissionResult()) {
          <div class="submission-result" data-testid="submission-result">
            {{ submissionResult() }}
          </div>
        }

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
          <div data-testid="submission-count">Submission count: {{ submissionCount() }}</div>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
  styles: [
    `
      .submission-status {
        padding: 1rem;
        background: #fff3e0;
        border: 1px solid #ff9800;
        border-radius: 4px;
        margin-top: 1rem;
      }
      .submission-result {
        padding: 1rem;
        background: #e8f5e9;
        border: 1px solid #4caf50;
        border-radius: 4px;
        margin-top: 1rem;
      }
    `,
  ],
})
export class BasicSubmissionComponent {
  testId = 'basic-submission';
  title = 'Basic Submission';

  value = signal<Record<string, unknown>>({});
  isSubmitting = signal(false);
  submissionResult = signal<string | null>(null);
  submissionCount = signal(0);

  config: FormConfig = {
    fields: [
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        props: {
          type: 'email',
          placeholder: 'Enter email',
        },
        required: true,
        col: 6,
      },
      {
        key: 'name',
        type: 'input',
        label: 'Name',
        props: {
          placeholder: 'Enter name',
        },
        required: true,
        col: 6,
      },
      {
        key: 'submitForm',
        type: 'submit',
        label: 'Submit',
        col: 12,
      },
    ],
    submission: {
      action: async (form) => {
        this.isSubmitting.set(true);
        this.submissionResult.set(null);

        // Simulate API call with delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        this.isSubmitting.set(false);
        this.submissionCount.update((c) => c + 1);
        this.submissionResult.set(`Submission successful at ${new Date().toISOString()}`);

        // No errors
        return undefined;
      },
    },
  };

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
