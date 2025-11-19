import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-multi-checkbox-disabled-options',
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" data-testid="multi-checkbox-disabled-options">
      <h2>Multi-Checkbox - Disabled Options</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output form-state">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-multi-checkbox-disabled-options'">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class MultiCheckboxDisabledOptionsComponent {
  config = {
    fields: [
      {
        key: 'features',
        type: 'multi-checkbox',
        label: 'Features',
        options: [
          { value: 'feature1', label: 'Feature 1' },
          { value: 'feature2', label: 'Feature 2', disabled: true },
          { value: 'feature3', label: 'Feature 3' },
        ],
      },
    ],
  };

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'multi-checkbox-disabled-options',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
