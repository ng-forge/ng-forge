import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{requiredLength}} characters',
    min: 'Value must be at least {{min}}',
    max: 'Value must be at most {{max}}',
    pattern: 'Invalid format',
  },
  fields: [
    // Required text field
    {
      key: 'requiredText',
      type: 'input',
      label: 'Required Text (minimum 5 characters)',
      props: {
        placeholder: 'Enter at least 5 characters',
      },
      required: true,
      minLength: 5,
      col: 12,
    },
    // Email validation
    {
      key: 'emailValidation',
      type: 'input',
      label: 'Email Validation',
      props: {
        type: 'email',
        placeholder: 'Enter valid email',
      },
      email: true,
      required: true,
      col: 12,
    },
    // Number with range validation
    {
      key: 'numberRange',
      type: 'input',
      label: 'Number (1-100)',
      props: {
        type: 'number',
        placeholder: 'Enter number between 1 and 100',
      },
      min: 1,
      max: 100,
      required: true,
      col: 12,
    },
    // Pattern validation
    {
      key: 'patternValidation',
      type: 'input',
      label: 'Pattern Validation (Only letters and spaces)',
      props: {
        placeholder: 'Only letters and spaces allowed',
      },
      pattern: '^[a-zA-Z\\s]+$',
      required: true,
      col: 12,
    },
    // Submit Button
    {
      key: 'submitValidation',
      type: 'submit',
      label: 'Submit with Validation',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const validationScenario: TestScenario = {
  testId: 'validation-test',
  title: 'Validation Testing',
  description: 'Testing various field validations and error handling',
  config,
};
