import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'example-multi-checkbox-deselect',
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" data-testid="multi-checkbox-deselect">
      <h2>Multi-Checkbox - Deselect Options</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output form-state">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-multi-checkbox-deselect'">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-styles.scss',
})
export class MultiCheckboxDeselectComponent {
  config = {
    fields: [
      {
        key: 'permissions',
        type: 'multi-checkbox',
        label: 'Permissions',
        options: [
          { value: 'read', label: 'Read' },
          { value: 'write', label: 'Write' },
          { value: 'delete', label: 'Delete' },
        ],
        value: ['read', 'write'],
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({
    permissions: ['read', 'write'],
  });

  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'multi-checkbox-deselect',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
