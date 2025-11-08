import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-ionic';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'example-checkbox-demo',
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
export class CheckboxDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        props: {
          labelPlacement: 'end',
        },
      },
      {
        key: 'terms',
        type: 'checkbox',
        label: 'I agree to the terms and conditions',
        required: true,
        props: {
          labelPlacement: 'end',
        },
      },
      {
        key: 'marketing',
        type: 'checkbox',
        label: 'Receive marketing communications',
        props: {
          labelPlacement: 'end',
        },
      },
    ],
  } as const satisfies FormConfig;
}
