import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, RegisteredFieldTypes } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-material';

@Component({
  selector: 'example-datepicker-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" (submit)="onSubmit($event)" />
    @if (submittedData) {
    <div class="example-result">
      <h4>Submitted Data:</h4>
      <pre>{{ submittedData | json }}</pre>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
    fields: [
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Birth Date',
        required: true,
        props: {
          placeholder: 'Select your birth date',
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(data: unknown) {
    this.submittedData = data;
  }
}
