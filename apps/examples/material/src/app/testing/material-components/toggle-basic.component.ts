import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-toggle-basic',
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" data-testid="toggle-basic">
      <h2>Toggle - Basic</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output form-state">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-toggle-basic'">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class ToggleBasicComponent {
  config = {
    fields: [
      {
        key: 'notifications',
        type: 'toggle',
        label: 'Enable Notifications',
        value: false,
      },
    ],
  };

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'toggle-basic',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
