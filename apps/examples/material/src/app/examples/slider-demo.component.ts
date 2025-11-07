import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'example-slider-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" (submit)="onSubmit($event)" />
    @if (submittedData) {
    <div class="example-result">
      <h4>Submitted Data:</h4>
      <pre>{{ submittedData | json }}</pre>
    </div>
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
        label: 'Notification Volume',
        minValue: 0,
        maxValue: 100,
        step: 10,
        value: 50,
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit',
      },
    ],
  };

  onSubmit(data: unknown) {
    this.submittedData = data;
  }
}
