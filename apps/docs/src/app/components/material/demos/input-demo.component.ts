import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-input-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withMaterialFields())],
  template: `
    <div class="demo-container">
      <dynamic-form [config]="fields" [(value)]="formOutput"></dynamic-form>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ formOutput() | json }}</pre>
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
export class InputDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'textInput',
        type: 'input',
        label: 'Text Input',
        props: {
          placeholder: 'Enter some text...',
          appearance: 'outline',
          hint: 'Basic text input field',
        },
      },
      {
        key: 'emailInput',
        type: 'input',
        label: 'Email Input',
        props: {
          type: 'email',
          placeholder: 'user@example.com',
          appearance: 'outline',
          hint: 'Email validation included',
        },
        required: true,
        email: true,
      },
      {
        key: 'passwordInput',
        type: 'input',
        label: 'Password Input',
        props: {
          type: 'password',
          placeholder: 'Enter password...',
          appearance: 'outline',
          hint: 'Hidden character input',
        },
      },
      {
        key: 'numberInput',
        type: 'input',
        label: 'Number Input',
        props: {
          type: 'number',
          placeholder: '123',
          appearance: 'outline',
          hint: 'Numeric input only',
        },
      },
    ],
  } as const satisfies FormConfig;
}
