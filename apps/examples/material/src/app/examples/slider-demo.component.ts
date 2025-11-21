import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';
import '@ng-forge/dynamic-forms-material';

@Component({
  selector: 'example-slider-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" [(value)]="formValue" />
    <div class="example-result">
      <h4>Form Data:</h4>
      <pre>{{ formValue() | json }}</pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'volume',
        type: 'slider',
        label: 'Notification Volume',
        minValue: 0,
        maxValue: 100,
        step: 10,
        value: 50,
      },
    ],
  } as const satisfies FormConfig;
}
