import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-slider-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withMaterialFields())],
  template: `
    <dynamic-form [config]="fields" [(value)]="formOutput" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
  `,
})
export class SliderDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'volume',
        type: 'slider',
        label: 'Volume Level',
        props: {
          color: 'primary',
          min: 0,
          max: 100,
          step: 5,
          showThumbLabel: true,
          hint: 'Adjust the volume (0-100)',
        },
      },
      {
        key: 'brightness',
        type: 'slider',
        label: 'Screen Brightness',
        props: {
          color: 'accent',
          min: 0,
          max: 100,
          step: 1,
          showThumbLabel: true,
          hint: 'Screen brightness percentage',
        },
      },
      {
        key: 'temperature',
        type: 'slider',
        label: 'Temperature (°C)',
        props: {
          color: 'primary',
          min: -10,
          max: 40,
          step: 1,
          showThumbLabel: true,
          hint: 'Set the temperature',
        },
      },
      {
        key: 'rating',
        type: 'slider',
        label: 'Rating',
        props: {
          color: 'accent',
          min: 1,
          max: 5,
          step: 1,
          showThumbLabel: true,
          hint: 'Rate from 1 to 5 stars',
        },
      },
    ],
  } as const satisfies FormConfig;
}
