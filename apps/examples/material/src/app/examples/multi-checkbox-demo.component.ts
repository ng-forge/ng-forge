import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'example-multi-checkbox-demo',
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
      background: #f5f5f5;
      border-radius: 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiCheckboxDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
    fields: [
      {
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Select Your Interests',
        required: true,
        options: [
          { value: 'sports', label: 'Sports' },
          { value: 'music', label: 'Music' },
          { value: 'reading', label: 'Reading' },
          { value: 'travel', label: 'Travel' },
          { value: 'cooking', label: 'Cooking' },
        ],
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
