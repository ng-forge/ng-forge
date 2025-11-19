import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, HttpCustomValidator } from '@ng-forge/dynamic-form';
import type { FieldContext } from '@angular/forms/signals';

const checkUsernameAvailability: HttpCustomValidator = {
  request: (ctx: FieldContext<string>) => `/api/users/check-username?username=${encodeURIComponent(ctx.value() as string)}`,
  onSuccess: (response: { available: boolean }, ctx: FieldContext<string>) => {
    return response.available ? null : { kind: 'usernameTaken' };
  },
  onError: (error: any, ctx: FieldContext<string>) => null, // Don't block form on network errors
};

/**
 * Multiple Validators Test Component
 * Tests async validation combined with synchronous validators
 */
@Component({
  selector: 'example-multiple-validators-test',
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
  styleUrl: '../test-styles.scss',
})
export class MultipleValidatorsTestComponent {
  formValue = signal<Record<string, unknown>>({});

  config = {
    fields: [
      {
        key: 'username',
        type: 'input' as const,
        label: 'Username',
        required: true,
        minLength: 3,
        maxLength: 20,
        validators: [
          {
            type: 'customHttp' as const,
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
        type: 'submit' as const,
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
      testId: 'multiple-validators-test',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
