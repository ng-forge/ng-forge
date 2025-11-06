import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';

@Component({
  selector: 'app-input-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withPrimeNGFields())],
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
          variant: 'outlined', // PrimeNG variant: 'outlined' | 'filled'
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
          variant: 'outlined',
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
          variant: 'outlined',
          hint: 'Hidden character input',
        },
        required: true,
        minLength: 8,
      },
      {
        key: 'numberInput',
        type: 'input',
        label: 'Number Input',
        props: {
          type: 'number',
          placeholder: '123',
          variant: 'outlined',
          hint: 'Numeric input only',
        },
      },
      {
        key: 'phoneInput',
        type: 'input',
        label: 'Phone Input',
        props: {
          type: 'tel',
          placeholder: '+1 (555) 123-4567',
          variant: 'filled', // Filled variant example
          hint: 'Telephone number',
        },
      },
      {
        key: 'urlInput',
        type: 'input',
        label: 'URL Input',
        props: {
          type: 'url',
          placeholder: 'https://example.com',
          variant: 'outlined',
          size: 'large', // PrimeNG size: 'small' | 'large'
          hint: 'Website URL',
        },
      },
      {
        key: 'searchInput',
        type: 'input',
        label: 'Search Input',
        props: {
          type: 'search',
          placeholder: 'Search...',
          variant: 'outlined',
          size: 'small',
          styleClass: 'custom-input-class', // Custom CSS class
          hint: 'Search functionality',
        },
      },
    ],
  } as const satisfies FormConfig;
}
