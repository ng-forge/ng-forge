import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, RegisteredFieldTypes } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-material';

@Component({
  selector: 'example-radio-demo',
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
export class RadioDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
    fields: [
      {
        key: 'gender',
        type: 'radio',
        label: 'Gender',
        required: true,
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        key: 'contactMethod',
        type: 'radio',
        label: 'Preferred Contact Method',
        options: [
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'sms', label: 'SMS' },
        ],
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
