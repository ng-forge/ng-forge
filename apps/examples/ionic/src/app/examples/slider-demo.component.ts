import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'example-slider-demo',
  imports: [DynamicForm, JsonPipe, IonContent, IonHeader, IonTitle, IonToolbar],
  host: {
    class: 'example-container',
  },
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Slider Example</ion-title>
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
export class SliderDemoComponent {
  formOutput = signal({});

  config: FormConfig = {
    fields: [
      {
        key: 'volume',
        type: 'slider',
        label: 'Volume',
        minValue: 0,
        maxValue: 100,
        step: 5,
        props: {
          pin: true,
        },
      },
      {
        key: 'brightness',
        type: 'slider',
        label: 'Brightness',
        minValue: 0,
        maxValue: 100,
        step: 10,
        props: {
          pin: true,
          ticks: true,
          snaps: true,
        },
      },
    ],
  };
}
