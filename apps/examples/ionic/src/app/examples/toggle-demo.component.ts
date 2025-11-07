import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'example-toggle-demo',
  imports: [DynamicForm, JsonPipe, IonContent, IonHeader, IonTitle, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Toggle Example</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div style="padding: 1rem;">
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
  };
}
