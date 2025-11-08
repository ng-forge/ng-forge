import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'example-multi-checkbox-demo',
  imports: [DynamicForm, JsonPipe, IonContent, IonHeader, IonTitle, IonToolbar],
  host: {
    class: 'example-container',
  },
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Multi-Checkbox Example</ion-title>
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
export class MultiCheckboxDemoComponent {
  formOutput = signal({});

  config: FormConfig = {
    fields: [
      {
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Interests',
        options: [
          { value: 'sports', label: 'Sports' },
          { value: 'music', label: 'Music' },
          { value: 'technology', label: 'Technology' },
          { value: 'art', label: 'Art' },
        ],
      },
      {
        key: 'skills',
        type: 'multi-checkbox',
        label: 'Technical Skills',
        options: [
          { value: 'angular', label: 'Angular' },
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue.js' },
          { value: 'node', label: 'Node.js' },
        ],
      },
    ],
  };
}
