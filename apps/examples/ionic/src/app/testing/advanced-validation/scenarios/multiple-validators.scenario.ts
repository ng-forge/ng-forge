import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    minLength: 'Must be at least {{requiredLength}} characters',
    maxLength: 'Must be no more than {{requiredLength}} characters',
    pattern: 'Only alphanumeric characters and underscores allowed',
  },
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: '^[a-zA-Z0-9_]+$',
      validators: [
        {
          type: 'custom',
          expression: 'fieldValue !== "admin" && fieldValue !== "root"',
          kind: 'noReservedWords',
        },
      ],
      validationMessages: {
        noReservedWords: 'Username cannot be "admin" or "root"',
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

export const multipleValidatorsScenario: TestScenario = {
  testId: 'multiple-validators-test',
  title: 'Multiple Validators Test',
  description: 'Username must be 3-20 characters, alphanumeric with underscores, and not "admin" or "root"',
  config,
};
