import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap/no-augmentation';
import { BootstrapDesignContainer } from '../bootstrap.container';

@Component({
  selector: 'app-bs-textarea-demo',
  imports: [DynamicForm, JsonPipe, BootstrapDesignContainer],
  providers: [provideDynamicForm(...withBootstrapFields())],
  template: `
    <app-bootstrap-container>
      <h3>Bootstrap Textarea Examples</h3>
      <p>Demonstration of textarea fields with various configurations.</p>
      <dynamic-form [config]="fields" [(value)]="formOutput" />
      <h4>Form Data:</h4>
      <pre>{{ formOutput() | json }}</pre>
    </app-bootstrap-container>
  `,
})
export class BsTextareaDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'basicTextarea',
        type: 'textarea',
        label: 'Basic Textarea',
        props: {
          placeholder: 'Enter your message...',
          helpText: 'Default textarea with 3 rows',
          rows: 3,
        },
      },
      {
        key: 'floatingTextarea',
        type: 'textarea',
        label: 'Floating Label Textarea',
        props: {
          placeholder: 'Your message here',
          floatingLabel: true,
          helpText: 'Textarea with floating label',
          rows: 4,
        },
      },
      {
        key: 'tallTextarea',
        type: 'textarea',
        label: 'Tall Textarea',
        props: {
          placeholder: 'Enter a longer message...',
          helpText: 'Textarea with 6 rows',
          rows: 6,
        },
      },
      {
        key: 'smallTextarea',
        type: 'textarea',
        label: 'Small Textarea',
        props: {
          placeholder: 'Small size textarea',
          size: 'sm',
          helpText: 'Small size variant',
          rows: 3,
        },
      },
      {
        key: 'largeTextarea',
        type: 'textarea',
        label: 'Large Textarea',
        props: {
          placeholder: 'Large size textarea',
          size: 'lg',
          helpText: 'Large size variant',
          rows: 3,
        },
      },
      {
        key: 'requiredTextarea',
        type: 'textarea',
        label: 'Required Textarea',
        props: {
          placeholder: 'This field is required...',
          helpText: 'Minimum 10 characters required',
          validFeedback: 'Looks good!',
          invalidFeedback: 'Please enter at least 10 characters',
          rows: 4,
        },
        required: true,
        minLength: 10,
      },
      {
        key: 'descriptionTextarea',
        type: 'textarea',
        label: 'Project Description',
        props: {
          placeholder: 'Describe your project in detail...',
          helpText: 'Provide a detailed description of your project (50-500 characters)',
          rows: 5,
        },
        required: true,
        minLength: 50,
        maxLength: 500,
      },
    ],
  } as const satisfies FormConfig;
}
