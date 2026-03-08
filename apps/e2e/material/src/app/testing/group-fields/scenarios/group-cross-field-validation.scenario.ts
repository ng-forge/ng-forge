import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    passwordMismatch: 'Passwords must match',
  },
  fields: [
    {
      type: 'group',
      key: 'credentials',
      fields: [
        {
          key: 'password',
          type: 'input',
          label: 'Password',
          value: '',
          required: true,
          props: { type: 'password' },
        },
        {
          key: 'confirmPassword',
          type: 'input',
          label: 'Confirm Password',
          value: '',
          required: true,
          props: { type: 'password' },
          validators: [
            {
              type: 'custom' as const,
              expression: 'fieldValue === formValue.credentials.password',
              kind: 'passwordMismatch',
            },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const groupCrossFieldValidationScenario: TestScenario = {
  testId: 'group-cross-field-validation',
  title: 'Group Cross-Field Validation',
  description: 'Cross-field validators inside group containers route errors to the correct field',
  config,
  initialValue: {},
};
