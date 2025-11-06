import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap/no-augmentation';
import { BootstrapDesignContainer } from '../bootstrap.container';

@Component({
  selector: 'app-bs-slider-demo',
  imports: [DynamicForm, JsonPipe, BootstrapDesignContainer],
  providers: [provideDynamicForm(...withBootstrapFields())],
  template: `
    <app-bootstrap-container>
      <h3>Bootstrap Slider Examples</h3>
      <p>Demonstration of range slider inputs with various configurations.</p>
      <dynamic-form [config]="fields" [(value)]="formOutput" />
      <h4>Form Data:</h4>
      <pre>{{ formOutput() | json }}</pre>
    </app-bootstrap-container>
  `,
})
export class BsSliderDemoComponent {
  formOutput = signal({
    basicSlider: 50,
    volumeSlider: 75,
    priceSlider: 500,
    percentageSlider: 25,
    stepSlider: 50,
    smallRangeSlider: 5,
  });

  fields = {
    fields: [
      {
        key: 'basicSlider',
        type: 'slider',
        label: 'Basic Slider',
        props: {
          min: 0,
          max: 100,
          step: 1,
          helpText: 'Default slider with range 0-100',
        },
      },
      {
        key: 'sliderWithValue',
        type: 'slider',
        label: 'Slider with Value Display',
        props: {
          min: 0,
          max: 100,
          step: 1,
          showValue: true,
          helpText: 'Displays current value',
        },
      },
      {
        key: 'volumeSlider',
        type: 'slider',
        label: 'Volume Control',
        props: {
          min: 0,
          max: 100,
          step: 5,
          showValue: true,
          valueSuffix: '%',
          helpText: 'Volume control with percentage display',
        },
      },
      {
        key: 'priceSlider',
        type: 'slider',
        label: 'Price Range',
        props: {
          min: 0,
          max: 1000,
          step: 50,
          showValue: true,
          valuePrefix: '$',
          helpText: 'Price slider with dollar prefix',
        },
      },
      {
        key: 'percentageSlider',
        type: 'slider',
        label: 'Percentage Slider',
        props: {
          min: 0,
          max: 100,
          step: 5,
          showValue: true,
          valuePrefix: 'Value: ',
          valueSuffix: '%',
          helpText: 'Slider with both prefix and suffix',
        },
      },
      {
        key: 'stepSlider',
        type: 'slider',
        label: 'Large Step Slider',
        props: {
          min: 0,
          max: 100,
          step: 10,
          showValue: true,
          helpText: 'Slider with 10-unit steps',
        },
      },
      {
        key: 'smallRangeSlider',
        type: 'slider',
        label: 'Small Range Slider',
        props: {
          min: 1,
          max: 10,
          step: 1,
          showValue: true,
          helpText: 'Slider with small range (1-10)',
        },
      },
      {
        key: 'temperatureSlider',
        type: 'slider',
        label: 'Temperature',
        props: {
          min: -20,
          max: 40,
          step: 1,
          showValue: true,
          valueSuffix: '°C',
          helpText: 'Temperature control in Celsius',
        },
      },
    ],
  } as const satisfies FormConfig;
}
