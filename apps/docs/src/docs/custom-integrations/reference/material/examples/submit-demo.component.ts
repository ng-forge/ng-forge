import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { submitButton, withMaterialFields } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-button-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withMaterialFields())],
  template: `
    <dynamic-form [config]="fields" [(value)]="formOutput" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
  `,
})
export class SubmitDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
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
        // validators: {
        //   required: true,
        //   email: true,
        // },
      },
      {
        key: 'agree',
        type: 'checkbox',
        props: {
          label: 'I agree to the terms and conditions',
          color: 'primary',
          required: true,
        },
        // validators: {
        //   required: true,
        // },
      },

      // Primary raised button
      submitButton({
        key: 'submit',
        label: 'Submit Form',
        // variant: 'raised',
        className: 'button-btn',
        props: {
          color: 'primary',
        },
      }),

      // Accent stroked button
      submitButton({
        key: 'draft',
        label: 'Save Draft',
        // variant: 'stroked',
        className: 'draft-btn',
        props: {
          color: 'accent',
        },
      }),

      // Basic button
      submitButton({
        key: 'cancel',
        label: 'Cancel',
        props: {
          color: 'warn',
        },
        // variant: 'basic',
        className: 'cancel-btn',
      }),
    ],
  } as const satisfies FormConfig;
}
