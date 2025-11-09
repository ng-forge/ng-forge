import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-ionic';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'example-datepicker-demo',
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
export class DatepickerDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Birth Date',
        required: true,
        validationMessages: {
          required: 'This field is required',
        },
        props: {
          placeholder: 'Select your birth date',
        },
      },
    ],
  } as const satisfies FormConfig;
}
