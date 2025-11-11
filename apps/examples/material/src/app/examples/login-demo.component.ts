import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-form';
import { JsonPipe } from '@angular/common';
import { submitButton } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'example-login-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" [(value)]="formValue" />
    <div class="example-result">
      <h4>Form Data:</h4>
      <pre>{{ formValue() | json }}</pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDemoComponent {
  formValue = signal({});

  config = {
    // Define common validation messages at the form level
    defaultValidationMessages: {
      required: 'This field is required',
      minLength: 'Must be at least {{requiredLength}} characters',
    },
    fields: [
      {
        key: 'title',
        type: 'text',
        label: 'Sign In',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        required: true,
        email: true,
        // Only specify custom message for 'email' - 'required' uses default
        validationMessages: {
          email: 'Please enter a valid email address',
        },
        props: {
          type: 'email',
          placeholder: 'your@email.com',
          hint: 'Enter the email associated with your account',
        },
      },
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        required: true,
        minLength: 8,
        // Override default 'required' message with custom one
        validationMessages: {
          required: 'Password is required',
        },
        // 'minLength' will use default with interpolated {{requiredLength}}
        props: {
          type: 'password',
          placeholder: 'Enter your password',
        },
      },
      {
        key: 'remember',
        type: 'checkbox',
        label: 'Remember me for 30 days',
      },
      submitButton({
        key: 'submit',
        label: 'Sign In',
        props: {
          color: 'primary',
        },
      }),
    ],
  } as const satisfies FormConfig;
}
