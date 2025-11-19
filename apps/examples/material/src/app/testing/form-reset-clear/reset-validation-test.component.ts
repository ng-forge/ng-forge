import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormResetEvent } from '@ng-forge/dynamic-form';

/**
 * Reset Validation Test Component
 * Tests resetting validation state of form fields
 */
@Component({
  selector: 'app-reset-validation-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-scenario" data-testid="reset-validation">
      <h2>Reset Validation State</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-reset-validation'">{{ value() | json }}</pre>
      </details>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class ResetValidationTestComponent {
  config = {
    fields: [
      {
        key: 'email',
        type: 'input' as const,
        label: 'Email',
        value: 'valid@example.com',
        required: true,
        email: true,
        props: {
          type: 'email',
        },
      },
      {
        key: 'reset-button',
        type: 'button' as const,
        label: 'Reset',
        event: FormResetEvent,
        props: {
          type: 'button',
        },
      },
    ],
  };

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
