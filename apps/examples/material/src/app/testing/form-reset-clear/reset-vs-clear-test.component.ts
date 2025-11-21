import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormClearEvent, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';

/**
 * Reset vs Clear Test Component
 * Tests the differences in behavior between reset and clear operations
 */
@Component({
  selector: 'example-reset-vs-clear-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-scenario" data-testid="reset-vs-clear">
      <h2>Reset vs Clear Behavior</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-reset-vs-clear'">{{ value() | json }}</pre>
      </details>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ResetVsClearTestComponent {
  config = {
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Name',
        value: 'Default Name',
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email (no default)',
        props: {
          type: 'email',
        },
        // No default value
      },
      {
        key: 'reset-button',
        type: 'button',
        label: 'Reset',
        event: FormResetEvent,
        props: {
          type: 'button',
        },
      },
      {
        key: 'clear-button',
        type: 'button',
        label: 'Clear',
        event: FormClearEvent,
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
