import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-ionic';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'example-toggle-demo',
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
export class ToggleDemoComponent {
  formValue = signal({});

  config = {
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
