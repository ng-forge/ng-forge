import { FormConfig } from '@ng-forge/dynamic-forms';

export const buttonConfig = {
  fields: [
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email',
      required: true,
      email: true,
      validationMessages: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
      },
      placeholder: 'Enter your email',
      props: {
        type: 'email',
      },
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Submit Form',
    },
  ],
} as const satisfies FormConfig;
