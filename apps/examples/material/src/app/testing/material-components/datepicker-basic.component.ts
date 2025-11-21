import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'example-datepicker-basic',
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" data-testid="datepicker-basic">
      <h2>Datepicker - Basic</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output form-state">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-datepicker-basic'">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-styles.scss',
})
export class DatepickerBasicComponent {
  config = {
    fields: [
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Date of Birth',
        required: true,
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'datepicker-basic',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
