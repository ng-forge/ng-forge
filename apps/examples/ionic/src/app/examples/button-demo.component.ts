import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-ionic';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'example-button-demo',
  imports: [DynamicForm, JsonPipe, IonContent],
  host: {
    class: 'example-container',
  },
  template: `
    <ion-content>
      <div>
        <h4>Button Examples</h4>
        <p>Showcasing all Ionic button types with various colors and styles.</p>

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
export class ButtonDemoComponent {
  formValue = signal({});

  config = {
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
    ],
  } as const satisfies FormConfig;
}
