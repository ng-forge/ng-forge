import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';

/**
 * Reset Nested Test Component
 * Tests resetting nested group fields
 */
@Component({
  selector: 'example-reset-nested-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-scenario" data-testid="reset-nested">
      <h2>Reset Nested Group Fields</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-reset-nested'">{{ value() | json }}</pre>
      </details>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ResetNestedTestComponent {
  config = {
    fields: [
      {
        key: 'userInfo',
        type: 'group',
        label: 'User Information',
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            value: 'John',
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            value: 'Doe',
          },
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
