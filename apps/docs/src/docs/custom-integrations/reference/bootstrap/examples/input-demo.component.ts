import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap/no-augmentation';
import { BootstrapDesignContainer } from '../bootstrap.container';

@Component({
  selector: 'app-bs-input-demo',
  imports: [DynamicForm, JsonPipe, BootstrapDesignContainer],
  providers: [provideDynamicForm(...withBootstrapFields())],
  template: `
    <app-bootstrap-container>
      <h3>Bootstrap Input Examples</h3>
      <p>Demonstration of various input field types with Bootstrap styling.</p>
      <dynamic-form [config]="fields" [(value)]="formOutput" />
      <h4>Form Data:</h4>
      <pre>{{ formOutput() | json }}</pre>
    </app-bootstrap-container>
  `,
})
export class BsInputDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'textInput',
        type: 'input',
        label: 'Text Input',
        props: {
          placeholder: 'Enter some text...',
          helpText: 'Basic text input field with Bootstrap styling',
        },
      },
      {
        key: 'textInputFloating',
        type: 'input',
        label: 'Floating Label',
        props: {
          placeholder: 'Floating label input',
          floatingLabel: true,
          helpText: 'Input with floating label style',
        },
      },
      {
        key: 'emailInput',
        type: 'input',
        label: 'Email Input',
        props: {
          type: 'email',
          placeholder: 'user@example.com',
          helpText: 'Email validation included',
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
          helpText: 'Hidden character input',
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
          helpText: 'Numeric input only',
        },
      },
      {
        key: 'smallInput',
        type: 'input',
        label: 'Small Input',
        props: {
          placeholder: 'Small size input',
          size: 'sm',
          helpText: 'Small size variant',
        },
      },
      {
        key: 'largeInput',
        type: 'input',
        label: 'Large Input',
        props: {
          placeholder: 'Large size input',
          size: 'lg',
          helpText: 'Large size variant',
        },
      },
      {
        key: 'validatedInput',
        type: 'input',
        label: 'Input with Validation Feedback',
        props: {
          placeholder: 'Must be at least 5 characters',
          validFeedback: 'Looks good!',
          invalidFeedback: 'Please enter at least 5 characters',
        },
        required: true,
        minLength: 5,
      },
    ],
  } as const satisfies FormConfig;
}
