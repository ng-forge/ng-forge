import { FormConfig } from '@ng-forge/dynamic-forms';

export const loginConfig = {
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
      validationMessages: {
        email: 'Please enter a valid email address',
      },
      placeholder: 'your@email.com',
      props: {
        type: 'email',
        hint: 'Enter the email associated with your account',
      },
    },
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      required: true,
      minLength: 8,
      validationMessages: {
        required: 'Password is required',
      },
      placeholder: 'Enter your password',
      props: {
        type: 'password',
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
    },
  ],
} as const satisfies FormConfig;
