import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-ionic';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'example-radio-demo',
  imports: [DynamicForm, JsonPipe, IonContent],
  host: {
    class: 'example-container',
  },
  template: `
    <ion-content>
      <div>
        <dynamic-form [config]="config" [(value)]="formValue" />
        <div class="example-result">
          <h4>Form Data:</h4>
          <pre>{{ formValue() | json }}</pre>
        </div>
      </div>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'gender',
        type: 'radio',
        label: 'Gender',
        required: true,
        validationMessages: {
          required: 'This field is required',
        },
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
    ],
  } as const satisfies FormConfig;
}
