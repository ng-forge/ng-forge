import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'input-demo',
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
export class InputDemoComponent {
  model = signal({
    textInput: '',
    emailInput: '',
    passwordInput: '',
    numberInput: null,
  });

  fields: FieldConfig[] = [
    {
      key: 'textInput',
      type: 'input',
      props: {
        label: 'Text Input',
        placeholder: 'Enter some text...',
        appearance: 'outline',
        hint: 'Basic text input field',
      },
    },
    {
      key: 'emailInput',
      type: 'input',
      props: {
        label: 'Email Input',
        type: 'email',
        placeholder: 'user@example.com',
        appearance: 'outline',
        hint: 'Email validation included',
        required: true,
      },
      validators: {
        required: true,
        email: true,
      },
    },
    {
      key: 'passwordInput',
      type: 'input',
      props: {
        label: 'Password Input',
        type: 'password',
        placeholder: 'Enter password...',
        appearance: 'outline',
        hint: 'Hidden character input',
      },
    },
    {
      key: 'numberInput',
      type: 'input',
      props: {
        label: 'Number Input',
        type: 'number',
        placeholder: '123',
        appearance: 'outline',
        hint: 'Numeric input only',
      },
    },
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}
