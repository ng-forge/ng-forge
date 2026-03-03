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
      key: 'password',
      type: 'input',
      label: 'Password',
      props: {
        type: 'password',
        placeholder: 'Enter password',
      },
      required: true,
      minLength: 8,
      col: 6,
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      props: {
        type: 'password',
        placeholder: 'Confirm password',
      },
      required: true,
      col: 6,
      validators: [
        {
          type: 'custom',
          expression: 'fieldValue === formValue.password',
          kind: 'passwordMatch',
        },
      ],
      validationMessages: {
        passwordMatch: 'Passwords must match',
      },
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      props: {
        type: 'email',
        placeholder: 'Enter email',
      },
      email: true,
      required: true,
      col: 12,
    },
    {
      key: 'submitPassword',
      type: 'submit',
      label: 'Create Account',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const passwordValidationScenario: TestScenario = {
  testId: 'password-validation',
  title: 'Password Confirmation Validation',
  description: 'Tests cross-field validation with password matching',
  config,
};
