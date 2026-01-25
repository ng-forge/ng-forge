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
      props: {
        placeholder: 'John Doe',
      },
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
      props: {
        type: 'email',
        placeholder: 'you@example.com',
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
      props: {
        placeholder: 'How can we help?',
        rows: 3,
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Send Message',
      props: {
        color: 'primary',
      },
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
      props: {
        type: 'email',
        placeholder: 'try "not-an-email"',
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
      props: {
        type: 'password',
        placeholder: 'try "weak"',
      },
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      required: true,
      min: 18,
      max: 120,
      props: {
        type: 'number',
        placeholder: 'try 10 or 150',
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
      props: {
        placeholder: 'try "AB" or "Invalid User!"',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: {
        color: 'primary',
      },
    },
  ],
} as const satisfies FormConfig;
