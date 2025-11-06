import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';

@Component({
  selector: 'lib-prime-input-example',
  standalone: true,
  imports: [CommonModule, DynamicForm],
  providers: [provideDynamicForm(...withPrimeNGFields())],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="prime-example-container">
      <h3>PrimeNG Input Example</h3>
      <dynamic-form [config]="config" (submit)="onSubmit($event)" />
      @if (submittedData) {
      <div class="result">
        <h4>Form Value:</h4>
        <pre>{{ submittedData | json }}</pre>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .prime-example-container {
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
      }
      .result {
        margin-top: 1rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeInputExampleComponent {
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
