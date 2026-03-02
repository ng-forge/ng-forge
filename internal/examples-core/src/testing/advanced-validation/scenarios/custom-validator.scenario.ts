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
      validators: [
        {
          type: 'custom',
          expression:
            'fieldValue && fieldValue.match("[A-Z]") && fieldValue.match("[a-z]") && fieldValue.match("[0-9]") && fieldValue.match("[!@#$%^&*(),.?\\":{}|<>]")',
          kind: 'strongPassword',
        },
      ],
      validationMessages: {
        strongPassword: 'Password must contain uppercase, lowercase, number and special character',
      },
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const customValidatorScenario: TestScenario = {
  testId: 'custom-validator-test',
  title: 'Custom Validator Test',
  description: 'Password must contain uppercase, lowercase, number and special character',
  config,
};
