import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-datepicker-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withMaterialFields())],
  template: `
    <div class="demo-container">
      <dynamic-form [config]="fields" [(value)]="formOutput"></dynamic-form>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ formOutput() | json }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        margin: 1rem 0;
      }
      .output {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e0e0e0;
      }
      pre {
        background: #f5f5f5;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.9rem;
        margin: 0.5rem 0;
      }
    `,
  ],
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
