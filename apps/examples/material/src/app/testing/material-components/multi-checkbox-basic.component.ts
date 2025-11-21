import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'example-multi-checkbox-basic',
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" data-testid="multi-checkbox-basic">
      <h2>Multi-Checkbox - Basic</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output form-state">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-multi-checkbox-basic'">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-styles.scss',
})
export class MultiCheckboxBasicComponent {
  config = {
    fields: [
      {
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Interests',
        options: [
          { value: 'sports', label: 'Sports' },
          { value: 'music', label: 'Music' },
          { value: 'reading', label: 'Reading' },
        ],
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'multi-checkbox-basic',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
