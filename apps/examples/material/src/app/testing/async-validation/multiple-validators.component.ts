import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import type { HttpCustomValidator } from '@ng-forge/dynamic-form';
import { DynamicForm } from '@ng-forge/dynamic-form';

const checkUsernameAvailability: HttpCustomValidator = {
  url: (ctx) => `/api/users/check-username?username=${encodeURIComponent(ctx.value() as string)}`,
  method: 'GET',
  mapResponse: (response) => {
    return response.available ? null : { kind: 'usernameTaken' };
  },
  onError: () => null, // Don't block form on network errors
};

/**
 * Multiple Validators Test Component
 * Tests async validation combined with synchronous validators
 */
@Component({
  selector: 'app-multiple-validators-test',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Multiple Validators Test</h1>

      <section class="test-scenario" data-testid="multiple-validators-test">
        <h2>Combined Sync and Async Validation</h2>
        <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-multiple-validators-test'">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class MultipleValidatorsTestComponent {
  formValue = signal<Record<string, unknown>>({});

  config = {
    fields: [
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        required: true,
        minLength: 3,
        maxLength: 20,
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
  };

  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'multiple-validators-test',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
