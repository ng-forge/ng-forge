import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';

/**
 * Reset Select Test Component
 * Tests resetting select fields to their default values
 */
@Component({
  selector: 'example-reset-select-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-scenario" data-testid="reset-select">
      <h2>Reset Select Fields</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-reset-select'">{{ value() | json }}</pre>
      </details>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ResetSelectTestComponent {
  config = {
    fields: [
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        value: 'us',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
        ],
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
