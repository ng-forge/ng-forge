import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';

/**
 * Reset Checkbox Test Component
 * Tests resetting checkbox fields to their default values
 */
@Component({
  selector: 'example-reset-checkbox-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-scenario" data-testid="reset-checkbox">
      <h2>Reset Checkbox Fields</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-reset-checkbox'">{{ value() | json }}</pre>
      </details>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ResetCheckboxTestComponent {
  config = {
    fields: [
      {
        key: 'subscribe',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        value: true,
      },
      {
        key: 'terms',
        type: 'checkbox',
        label: 'Accept terms',
        value: false,
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
