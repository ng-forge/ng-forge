import { FormConfig } from '@ng-forge/dynamic-forms';

export const heroFormConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'name',
      type: 'input',
      label: 'Your Name',
      required: true,
      placeholder: 'John Doe',
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      required: true,
      email: true,
      validationMessages: {
        email: 'Please enter a valid email address',
      },
      placeholder: 'you@example.com',
      props: {
        type: 'email',
      },
    },
    {
      key: 'message',
      type: 'textarea',
      label: 'Message',
      required: true,
      minLength: 10,
      validationMessages: {
        minLength: 'Message must be at least {{requiredLength}} characters',
      },
      placeholder: 'How can we help?',
      props: {
        rows: 2,
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Send Message',
    },
  ],
} as const satisfies FormConfig;
