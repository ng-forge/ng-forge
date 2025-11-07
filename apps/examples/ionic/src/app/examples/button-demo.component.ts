import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'example-button-demo',
  imports: [DynamicForm, JsonPipe, IonContent, IonHeader, IonTitle, IonToolbar],
  host: {
    class: 'example-container',
  },
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Button Example</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div>
        <h4>Button Examples</h4>
        <p>Showcasing all Ionic button types with various colors and styles.</p>

        <dynamic-form [config]="config" [(value)]="formOutput" />

        <h4>Form Data:</h4>
        <pre>{{ formOutput() | json }}</pre>
      </div>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDemoComponent {
  formOutput = signal({});

  config: FormConfig = {
    fields: [
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        value: '',
        required: true,
        props: {
          type: 'email',
          placeholder: 'Enter email',
        },
      },
      {
        type: 'submit',
        key: 'submitPrimary',
        label: 'Submit (Primary)',
        props: {
          color: 'primary',
        },
      },
      {
        type: 'submit',
        key: 'submitSuccess',
        label: 'Submit (Success)',
        props: {
          color: 'success',
        },
      },
      {
        type: 'submit',
        key: 'submitOutline',
        label: 'Submit (Outline)',
        props: {
          fill: 'outline',
          color: 'primary',
        },
      },
      {
        type: 'submit',
        key: 'submitClear',
        label: 'Submit (Clear)',
        props: {
          fill: 'clear',
        },
      },
    ],
  };
}
