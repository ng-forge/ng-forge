import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'example-checkbox-demo',
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
export class CheckboxDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
    fields: [
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
      },
      {
        key: 'terms',
        type: 'checkbox',
        label: 'I agree to the terms and conditions',
        required: true,
      },
      {
        key: 'marketing',
        type: 'checkbox',
        label: 'Receive marketing communications',
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
