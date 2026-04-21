import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{requiredLength}} characters',
  },
  fields: [
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      placeholder: 'Enter email',
      props: {
        type: 'email',
      },
      email: true,
      required: true,
    },
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      placeholder: 'Enter password',
      props: {
        type: 'password',
      },
      required: true,
      minLength: 8,
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      placeholder: 'Confirm password',
      props: {
        type: 'password',
      },
      required: true,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const crossFieldValidationScenario: TestScenario = {
  testId: 'cross-field-validation',
  title: 'Cross-Field Validation',
  description: 'Tests validation across multiple fields (email/password/confirmPassword)',
  config,
};
