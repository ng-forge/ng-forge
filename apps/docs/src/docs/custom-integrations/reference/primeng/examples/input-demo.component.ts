import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng/no-augmentation';

@Component({
  selector: 'app-input-demo',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withPrimeNGFields())],
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
export class InputDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
    fields: [
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email Address',
        props: {
          type: 'email',
          styleClass: 'w-full',
          hint: 'Enter your email address',
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit',
        props: {
          severity: 'primary',
        },
      },
    ],
  };

  onSubmit(data: unknown) {
    this.submittedData = data;
  }
}
