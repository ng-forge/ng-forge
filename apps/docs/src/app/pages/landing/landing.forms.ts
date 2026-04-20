import { FormConfig } from '@ng-forge/dynamic-forms';

export const heroFormConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Get in Touch',
      props: {
        elementType: 'h2',
      },
    },
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
        rows: 3,
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Send Message',
    },
  ],
} as const satisfies FormConfig;

export const validationFormConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Enter a valid email address',
    minLength: 'At least {{requiredLength}} characters needed',
    maxLength: 'Maximum {{requiredLength}} characters allowed',
    min: 'Must be at least {{min}}',
    max: 'Must be at most {{max}}',
    pattern: 'Invalid format',
  },
  fields: [
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      required: true,
      email: true,
      placeholder: 'try "not-an-email"',
      props: {
        type: 'email',
      },
    },
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      validationMessages: {
        pattern: 'Need uppercase, lowercase & number',
      },
      placeholder: 'try "weak"',
      props: {
        type: 'password',
      },
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      required: true,
      min: 18,
      max: 120,
      placeholder: 'try 10 or 150',
      props: {
        type: 'number',
      },
    },
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      required: true,
      minLength: 3,
      maxLength: 15,
      pattern: /^[a-z0-9_]+$/,
      validationMessages: {
        pattern: 'Only lowercase letters, numbers, underscores',
      },
      placeholder: 'try "AB" or "Invalid User!"',
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;
