import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-slider-demo',
  imports: [DynamicForm, JsonPipe],
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
        label: 'Volume',
        props: {
          min: 0, // Minimum value of the slider
          max: 100, // Maximum value of the slider
          step: 1, // Step increment for slider values
          hint: 'Adjust the volume level',
        },
      },
      {
        key: 'brightness',
        type: 'slider',
        label: 'Brightness',
        props: {
          min: 0,
          max: 100,
          step: 5, // Increment by 5
          hint: 'Adjust screen brightness',
        },
      },
      {
        key: 'priceRange',
        type: 'slider',
        label: 'Price Range',
        props: {
          min: 0,
          max: 1000,
          step: 10,
          range: true, // Enable range mode with two handles
          hint: 'Select min and max price',
        },
      },
      {
        key: 'temperature',
        type: 'slider',
        label: 'Temperature Range',
        props: {
          min: -20,
          max: 40,
          step: 1,
          range: true,
          hint: 'Select temperature range (°C)',
        },
      },
      {
        key: 'opacity',
        type: 'slider',
        label: 'Opacity',
        props: {
          min: 0,
          max: 1,
          step: 0.1, // Decimal step
          hint: 'Adjust opacity level',
        },
      },
      {
        key: 'customSlider',
        type: 'slider',
        label: 'Slider with Custom Styling',
        props: {
          min: 0,
          max: 200,
          step: 5,
          styleClass: 'custom-slider-class', // Custom CSS class
          hint: 'Custom styled slider',
        },
      },
    ],
  } as const satisfies FormConfig;
}
