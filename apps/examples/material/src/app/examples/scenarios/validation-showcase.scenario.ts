import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const validationShowcaseScenario: ExampleScenario = {
  id: 'validation-showcase',
  title: 'Validation Showcase',
  description: 'Try to break the form - see real-time validation in action.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
      email: 'Enter a valid email address',
      minLength: 'Too short',
      maxLength: 'Too long',
      min: 'Value too low',
      max: 'Value too high',
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
          minLength: 'At least 8 characters needed',
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
        validationMessages: {
          min: 'Must be at least 18',
          max: 'Must be at most 120',
        },
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
          minLength: 'At least 3 characters needed',
          maxLength: 'Maximum 15 characters allowed',
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
  } as const satisfies FormConfig,
};
