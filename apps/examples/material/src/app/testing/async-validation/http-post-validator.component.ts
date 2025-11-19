import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, HttpCustomValidator } from '@ng-forge/dynamic-form';
import type { FieldContext } from '@angular/forms/signals';

const validateEmail: HttpCustomValidator = {
  request: (ctx: FieldContext<string>) => ({
    url: '/api/users/validate-email',
    method: 'POST',
    body: {
      email: ctx.value(),
    },
  }),
  onSuccess: (response: { valid: boolean }, ctx: FieldContext<string>) => {
    return response.valid ? null : { kind: 'invalidEmail' };
  },
  onError: (error: any, ctx: FieldContext<string>) => null,
};

/**
 * HTTP POST Validator Test Component
 * Tests async validation using HTTP POST requests
 */
@Component({
  selector: 'example-http-post-validator-test',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>HTTP POST Validator Test</h1>

      <section class="test-scenario" data-testid="http-post-validator-test">
        <h2>Validate Email Address</h2>
        <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-http-post-validator-test'">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class HttpPostValidatorTestComponent {
  formValue = signal<Record<string, unknown>>({});

  config = {
    fields: [
      {
        key: 'email',
        type: 'input' as const,
        label: 'Email',
        props: {
          type: 'email',
        },
        required: true,
        validators: [
          {
            type: 'customHttp' as const,
            functionName: 'validateEmail',
          },
        ],
        validationMessages: {
          invalidEmail: 'This email address is not valid',
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
        validateEmail,
      },
    },
  } as const satisfies FormConfig;

  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'http-post-validator-test',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
