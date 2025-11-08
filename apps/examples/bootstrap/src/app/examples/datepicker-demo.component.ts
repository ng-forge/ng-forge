import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-datepicker-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" [(value)]="formValue" />
    <div class="example-result">
      <h4>Form Data:</h4>
      <pre>{{ formValue() | json }}</pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Birth Date',
        props: {
          helpText: 'Select your date of birth',
        },
        required: true,
      },
      {
        key: 'appointmentDate',
        type: 'datepicker' as const,
        label: 'Appointment Date',
        props: {
          floatingLabel: true,
          helpText: 'Choose an appointment date',
        },
      },
      {
        key: 'startDate',
        type: 'datepicker',
        label: 'Start Date',
        props: {
          size: 'lg' as const,
          helpText: 'Project start date',
        },
      },
    ],
  } as const satisfies FormConfig;
}
