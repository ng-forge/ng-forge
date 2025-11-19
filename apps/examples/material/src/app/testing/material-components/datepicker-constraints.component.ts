import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-datepicker-constraints',
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" data-testid="datepicker-constraints">
      <h2>Datepicker - Min/Max Constraints</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output form-state">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-datepicker-constraints'">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class DatepickerConstraintsComponent {
  config = {
    fields: [
      {
        key: 'appointmentDate',
        type: 'datepicker',
        label: 'Appointment Date',
        minDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        maxDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        required: true,
      },
    ],
  };

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'datepicker-constraints',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
