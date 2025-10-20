import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'slider-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container">
      <dynamic-form [fields]="fields" [value]="model()" (valueChange)="onValueChange($event)"></dynamic-form>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ model() | json }}</pre>
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
  model = signal({
    volume: 50,
    brightness: 75,
    temperature: 20,
    rating: 3,
  });

  fields: FieldConfig[] = [
    {
      key: 'volume',
      type: 'slider',
      props: {
        label: 'Volume Level',
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
      props: {
        label: 'Screen Brightness',
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
      props: {
        label: 'Temperature (°C)',
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
      props: {
        label: 'Rating',
        color: 'accent',
        min: 1,
        max: 5,
        step: 1,
        showThumbLabel: true,
        hint: 'Rate from 1 to 5 stars',
      },
    },
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}
