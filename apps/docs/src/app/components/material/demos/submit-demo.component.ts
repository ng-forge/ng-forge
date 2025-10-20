import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FieldConfig } from '@ng-forge/dynamic-form';
import { submitButton } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'submit-demo',
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
export class SubmitDemoComponent {
  model = signal({
    email: '',
    agree: false,
  });

  fields: FieldConfig[] = [
    {
      key: 'email',
      type: 'input',
      props: {
        label: 'Email Address',
        type: 'email',
        placeholder: 'user@example.com',
        appearance: 'outline',
        required: true,
      },
      validators: {
        required: true,
        email: true,
      },
    },
    {
      key: 'agree',
      type: 'checkbox',
      props: {
        label: 'I agree to the terms and conditions',
        color: 'primary',
        required: true,
      },
      validators: {
        required: true,
      },
    },

    // Primary raised button
    submitButton({
      label: 'Submit Form',
      color: 'primary',
      // variant: 'raised',
      className: 'submit-btn',
    }),

    // Accent stroked button
    submitButton({
      label: 'Save Draft',
      color: 'accent',
      // variant: 'stroked',
      className: 'draft-btn',
    }),

    // Basic button
    submitButton({
      label: 'Cancel',
      color: 'warn',
      // variant: 'basic',
      className: 'cancel-btn',
    }),
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}
