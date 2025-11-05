import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-slider-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withMaterialFields())],
  template: `
    <div class="demo-container">
      <dynamic-form [config]="fields" [(value)]="formOutput"></dynamic-form>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ formOutput() | json }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        margin: 1rem 0;
      }
      .output {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e0e0e0;
      }
      pre {
        background: #f5f5f5;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.9rem;
        margin: 0.5rem 0;
      }
    `,
  ],
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
