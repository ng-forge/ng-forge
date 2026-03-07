import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const loginScenario: ExampleScenario = {
  id: 'login',
  title: 'Login Demo',
  description: 'A login form demonstrating form-level default validation messages.',
  config: {
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
      {
        key: 'submit',
        type: 'submit',
        label: 'Sign In',
        props: {
          color: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig,
};
