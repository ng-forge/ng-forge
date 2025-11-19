import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-datepicker-clear',
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" data-testid="datepicker-clear">
      <h2>Datepicker - Clear Value</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output form-state">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-datepicker-clear'">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class DatepickerClearComponent {
  config = {
    fields: [
      {
        key: 'selectedDate',
        type: 'datepicker',
        label: 'Selected Date',
        value: new Date().toISOString(),
      },
    ],
  };

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'datepicker-clear',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
