import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormClearEvent, FormConfig, FormResetEvent } from '@ng-forge/dynamic-form';

/**
 * Required Reset Clear Test Component
 * Tests reset and clear behavior with required form fields
 */
@Component({
  selector: 'example-required-reset-clear-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-scenario" data-testid="required-reset-clear">
      <h2>Required Fields Reset/Clear</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-required-reset-clear'">{{ value() | json }}</pre>
      </details>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class RequiredResetClearTestComponent {
  config = {
    fields: [
      {
        key: 'requiredField',
        type: 'input',
        label: 'Required Field',
        value: 'Initial Value',
        required: true,
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
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
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
