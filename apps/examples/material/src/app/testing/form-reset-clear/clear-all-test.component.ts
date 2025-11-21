import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormClearEvent, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Clear All Test Component
 * Tests clearing all form fields
 */
@Component({
  selector: 'example-clear-all-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-scenario" data-testid="clear-all">
      <h2>Clear All Fields</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-clear-all'">{{ value() | json }}</pre>
      </details>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ClearAllTestComponent {
  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        // No default value - user must fill it
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        // No default value - user must fill it
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        props: {
          type: 'email',
        },
        // No default value - user must fill it
      },
      {
        key: 'clear-button',
        type: 'button',
        label: 'Clear All',
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
