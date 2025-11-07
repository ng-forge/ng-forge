import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-slider-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <dynamic-form [config]="config" (submit)="onSubmit($event)" />
    @if (submittedData) {
    <div class="result">
      <h4>Submitted Data:</h4>
      <pre>{{ submittedData | json }}</pre>
    </div>
    }
  `,
  styles: `
    .result {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 0.375rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
    fields: [
      {
        key: 'volume',
        type: 'slider',
        label: 'Volume',
        value: 50,
        props: {
          min: 0,
          max: 100,
          step: 1,
          showValue: true,
          valueSuffix: '%',
          helpText: 'Adjust the volume level',
        },
      },
      {
        key: 'temperature',
        type: 'slider',
        label: 'Temperature',
        value: 20,
        props: {
          min: -10,
          max: 40,
          step: 0.5,
          showValue: true,
          valueSuffix: '°C',
          helpText: 'Set temperature',
        },
      },
      {
        key: 'experience',
        type: 'slider',
        label: 'Years of Experience',
        value: 5,
        props: {
          min: 0,
          max: 20,
          step: 1,
          showValue: true,
          valueSuffix: ' years',
          helpText: 'Drag to select your experience',
        },
      },
      {
        key: 'brightness',
        type: 'slider',
        label: 'Brightness',
        value: 75,
        props: {
          min: 0,
          max: 100,
          step: 5,
          showValue: true,
          valueSuffix: '%',
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit',
        props: {
          variant: 'primary',
        },
      },
    ],
  };

  onSubmit(data: unknown) {
    this.submittedData = data;
  }
}
