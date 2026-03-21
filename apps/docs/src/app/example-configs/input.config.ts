import { FormConfig } from '@ng-forge/dynamic-forms';

export const inputConfig = {
  fields: [
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email Address',
      required: true,
      email: true,
      validationMessages: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
      },
      props: {
        type: 'email',
        placeholder: 'Enter your email',
      },
    },
    {
      key: 'username',
      type: 'input',
      value: '',
      label: 'Username',
      required: true,
      minLength: 3,
      validationMessages: {
        required: 'This field is required',
        minLength: 'Must be at least {{requiredLength}} characters',
      },
      props: {
        placeholder: 'Choose a username',
      },
    },
  ],
} as const satisfies FormConfig;
