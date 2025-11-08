import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, RegisteredFieldTypes } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-ionic';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'example-select-demo',
  imports: [DynamicForm, JsonPipe, IonContent, IonHeader, IonTitle, IonToolbar],
  host: {
    class: 'example-container',
  },
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Select Example</ion-title>
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
export class SelectDemoComponent {
  formOutput = signal({});

  config: FormConfig = {
    fields: [
      {
        key: 'framework',
        type: 'select',
        label: 'Framework',
        options: [
          { value: 'angular', label: 'Angular' },
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue.js' },
          { value: 'svelte', label: 'Svelte' },
        ],
        props: {
          placeholder: 'Choose a framework',
        },
      },
      {
        key: 'language',
        type: 'select',
        label: 'Language',
        options: [
          { value: 'typescript', label: 'TypeScript' },
          { value: 'javascript', label: 'JavaScript' },
          { value: 'python', label: 'Python' },
          { value: 'java', label: 'Java' },
        ],
        props: {
          placeholder: 'Choose a language',
          multiple: true,
        },
      },
    ],
  } as const satisfies FormConfig;
}
