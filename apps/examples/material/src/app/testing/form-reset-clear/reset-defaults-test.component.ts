import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormResetEvent } from '@ng-forge/dynamic-form';

/**
 * Reset Defaults Test Component
 * Tests resetting form fields to their default values
 */
@Component({
  selector: 'app-reset-defaults-test',
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
  styleUrl: '../test-component.styles.scss',
})
export class ResetDefaultsTestComponent {
  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input' as const,
        label: 'First Name',
        value: 'John',
        col: 6,
      },
      {
        key: 'lastName',
        type: 'input' as const,
        label: 'Last Name',
        value: 'Doe',
        col: 6,
      },
      {
        key: 'email',
        type: 'input' as const,
        label: 'Email',
        value: 'john.doe@example.com',
        props: {
          type: 'email',
        },
      },
      {
        key: 'reset-button',
        type: 'button' as const,
        label: 'Reset to Defaults',
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
