import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';

/**
 * Reset Defaults Test Component
 * Tests resetting form fields to their default values
 */
@Component({
  selector: 'example-reset-defaults-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-scenario" data-testid="reset-defaults">
      <h2>Reset to Default Values</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-reset-defaults'">{{ value() | json }}</pre>
      </details>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ResetDefaultsTestComponent {
  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        value: 'John',
        col: 6,
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        value: 'Doe',
        col: 6,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        value: 'john.doe@example.com',
        props: {
          type: 'email',
        },
      },
      {
        key: 'reset-button',
        type: 'button',
        label: 'Reset to Defaults',
        event: FormResetEvent,
        props: {
          type: 'button',
        },
      },
    ],
  } as const satisfies FormConfig;

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
