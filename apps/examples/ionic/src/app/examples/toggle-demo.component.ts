import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, RegisteredFieldTypes } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-ionic';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'example-toggle-demo',
  imports: [DynamicForm, JsonPipe, IonContent, IonHeader, IonTitle, IonToolbar],
  host: {
    class: 'example-container',
  },
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Toggle Example</ion-title>
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
export class ToggleDemoComponent {
  formOutput = signal({});

  config: FormConfig = {
    fields: [
      {
        key: 'darkMode',
        type: 'toggle',
        label: 'Dark Mode',
        props: {
          labelPlacement: 'start',
        },
      },
      {
        key: 'notifications',
        type: 'toggle',
        label: 'Enable Notifications',
        props: {
          labelPlacement: 'start',
        },
      },
      {
        key: 'twoFactor',
        type: 'toggle',
        label: 'Two-Factor Authentication',
        props: {
          labelPlacement: 'start',
        },
      },
    ],
  } as const satisfies FormConfig;
}
