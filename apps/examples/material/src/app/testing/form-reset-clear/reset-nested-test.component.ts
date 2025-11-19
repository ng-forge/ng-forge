import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormResetEvent } from '@ng-forge/dynamic-form';

/**
 * Reset Nested Test Component
 * Tests resetting nested group fields
 */
@Component({
  selector: 'app-reset-nested-test',
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
  styleUrl: '../test-component.styles.scss',
})
export class ResetNestedTestComponent {
  config = {
    fields: [
      {
        key: 'userInfo',
        type: 'group' as const,
        label: 'User Information',
        fields: [
          {
            key: 'firstName',
            type: 'input' as const,
            label: 'First Name',
            value: 'John',
          },
          {
            key: 'lastName',
            type: 'input' as const,
            label: 'Last Name',
            value: 'Doe',
          },
        ],
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
