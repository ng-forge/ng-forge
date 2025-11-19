import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormClearEvent } from '@ng-forge/dynamic-form';

/**
 * Clear All Test Component
 * Tests clearing all form fields
 */
@Component({
  selector: 'app-clear-all-test',
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
  styleUrl: '../test-component.styles.scss',
})
export class ClearAllTestComponent {
  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input' as const,
        label: 'First Name',
        // No default value - user must fill it
      },
      {
        key: 'lastName',
        type: 'input' as const,
        label: 'Last Name',
        // No default value - user must fill it
      },
      {
        key: 'email',
        type: 'input' as const,
        label: 'Email',
        props: {
          type: 'email',
        },
        // No default value - user must fill it
      },
      {
        key: 'clear-button',
        type: 'button' as const,
        label: 'Clear All',
        event: FormClearEvent,
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
