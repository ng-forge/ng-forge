import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-datepicker-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <dynamic-form [config]="fields" [(value)]="formOutput" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
  `,
})
export class DatepickerDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'birthdate',
        type: 'datepicker',
        label: 'Birth Date',
        props: {
          placeholder: 'Select your birth date',
          appearance: 'outline',
          hint: 'Used for age verification',
        },
      },
      {
        key: 'startDate',
        type: 'datepicker',
        label: 'Project Start Date',
        props: {
          placeholder: 'Select start date',
          appearance: 'fill',
          hint: 'When does the project begin?',
        },
        required: true,
      },
      {
        key: 'dueDate',
        type: 'datepicker',
        label: 'Due Date',
        props: {
          placeholder: 'Select due date',
          appearance: 'outline',
          hint: 'Project completion deadline',
        },
      },
    ],
  } as const satisfies FormConfig;
}
