import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormClearEvent, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';

/**
 * Multiple Cycles Test Component
 * Tests multiple reset and clear cycles
 */
@Component({
  selector: 'example-multiple-cycles-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-scenario" data-testid="multiple-cycles">
      <h2>Multiple Reset/Clear Cycles</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-multiple-cycles'">{{ value() | json }}</pre>
      </details>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class MultipleCyclesTestComponent {
  config = {
    fields: [
      {
        key: 'field',
        type: 'input',
        label: 'Field',
        value: 'Default',
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
