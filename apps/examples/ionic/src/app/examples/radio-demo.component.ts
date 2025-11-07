import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'example-radio-demo',
  imports: [DynamicForm, JsonPipe, IonContent, IonHeader, IonTitle, IonToolbar],
  host: {
    class: 'example-container',
  },
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Radio Example</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div>
        <dynamic-form [config]="config" [(value)]="formOutput" />
        <h4>Form Data:</h4>
        <pre>{{ formOutput() | json }}</pre>
      </div>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioDemoComponent {
  formOutput = signal({});

  config: FormConfig = {
    fields: [
      {
        key: 'plan',
        type: 'radio',
        label: 'Subscription Plan',
        props: {
          options: [
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
            { value: 'enterprise', label: 'Enterprise' },
          ],
        },
      },
      {
        key: 'contactMethod',
        type: 'radio',
        label: 'Preferred Contact Method',
        props: {
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
            { value: 'sms', label: 'SMS' },
          ],
        },
      },
    ],
  };
}
