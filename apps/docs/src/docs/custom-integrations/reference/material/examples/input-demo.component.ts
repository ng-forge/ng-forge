import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-input-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withMaterialFields())],
  template: `
    <dynamic-form [config]="fields" [(value)]="formOutput" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
  `,
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
