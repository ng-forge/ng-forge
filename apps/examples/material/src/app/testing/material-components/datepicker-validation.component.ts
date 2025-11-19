import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-datepicker-validation',
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" data-testid="datepicker-validation">
      <h2>Datepicker - Required Validation</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output form-state">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-datepicker-validation'">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class DatepickerValidationComponent {
  config = {
    fields: [
      {
        key: 'eventDate',
        type: 'datepicker',
        label: 'Event Date',
        required: true,
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  };

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'datepicker-validation',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
