import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, RegisteredFieldTypes } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-ionic';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'example-textarea-demo',
  imports: [DynamicForm, JsonPipe, IonContent, IonHeader, IonTitle, IonToolbar],
  host: {
    class: 'example-container',
  },
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Textarea Example</ion-title>
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
export class TextareaDemoComponent {
  formOutput = signal({});

  config: FormConfig = {
    fields: [
      {
        key: 'bio',
        type: 'textarea',
        label: 'Biography',
        value: '',
        maxLength: 500,
        props: {
          rows: 6,
          placeholder: 'Tell us about yourself',
          autoGrow: true,
        },
      },
      {
        key: 'comments',
        type: 'textarea',
        label: 'Comments',
        value: '',
        props: {
          rows: 4,
          placeholder: 'Additional comments',
        },
      },
    ],
  } as const satisfies FormConfig;
}
