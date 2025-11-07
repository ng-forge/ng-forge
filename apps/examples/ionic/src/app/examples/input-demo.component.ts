import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'example-input-demo',
  imports: [DynamicForm, JsonPipe, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent],
  host: {
    class: 'example-container',
  },
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Input Example</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div>
        <dynamic-form [config]="config()" (submit)="onSubmit($event)" />

        @if (submittedData()) {
        <ion-card>
          <ion-card-header>
            <ion-card-title>Submitted Data</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <pre>{{ submittedData() | json }}</pre>
          </ion-card-content>
        </ion-card>
        }
      </div>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDemoComponent {
  submittedData = signal<unknown>(null);

  config = signal<FormConfig>({
    fields: [
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email Address',
        props: {
          type: 'email',
          placeholder: 'Enter your email',
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit',
      },
    ],
  });

  onSubmit(data: unknown) {
    this.submittedData.set(data);
  }
}
