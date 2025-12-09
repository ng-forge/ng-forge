import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    minLength: 'Must be at least {{requiredLength}} characters',
  },
  fields: [
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      props: {
        type: 'password',
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
      },
      required: true,
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
      col: 6,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const crossFieldValidatorScenario: TestScenario = {
  testId: 'cross-field-test',
  title: 'Cross-Field Validation Test',
  description: 'Passwords must match between password and confirm password fields',
  config,
};
