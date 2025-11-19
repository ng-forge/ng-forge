import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, HttpCustomValidator } from '@ng-forge/dynamic-form';

const checkUsernameAvailability: HttpCustomValidator<string, string> = {
  request: (ctx) => `/api/users/check-username?username=${encodeURIComponent(ctx.value())}`,
  onSuccess: (response: unknown) => {
    const result = response as { available: boolean };
    return result.available ? null : { kind: 'usernameTaken' };
  },
  onError: () => null, // Don't block form on network errors
};

/**
 * HTTP Error Handling Test Component
 * Tests async validation error handling with HTTP requests
 */
@Component({
  selector: 'example-http-error-handling-test',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>HTTP Error Handling Test</h1>

      <section class="test-scenario" data-testid="http-error-handling-test">
        <h2>Error Handling with Network Requests</h2>
        <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-http-error-handling-test'">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class HttpErrorHandlingTestComponent {
  formValue = signal<Record<string, unknown>>({});

  config = {
    fields: [
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        required: true,
        validators: [
          {
            type: 'customHttp',
            functionName: 'checkUsernameAvailability',
          },
        ],
        validationMessages: {
          usernameTaken: 'This username is already taken',
        },
        col: 12,
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
        col: 12,
      },
    ],
    signalFormsConfig: {
      httpValidators: {
        checkUsernameAvailability,
      },
    },
  } as const satisfies FormConfig;

  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'http-error-handling-test',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
