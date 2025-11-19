import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormClearEvent } from '@ng-forge/dynamic-form';

/**
 * Clear Checkbox Test Component
 * Tests clearing checkbox fields
 */
@Component({
  selector: 'app-clear-checkbox-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-scenario" data-testid="clear-checkbox">
      <h2>Clear Checkbox Fields</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-clear-checkbox'">{{ value() | json }}</pre>
      </details>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class ClearCheckboxTestComponent {
  config = {
    fields: [
      {
        key: 'subscribe',
        type: 'checkbox' as const,
        label: 'Subscribe',
        // No default value - starts unchecked
      },
      {
        key: 'clear-button',
        type: 'button' as const,
        label: 'Clear',
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
