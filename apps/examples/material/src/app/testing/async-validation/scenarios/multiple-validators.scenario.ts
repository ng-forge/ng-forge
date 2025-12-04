import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';
import { checkUsernameAvailability } from '../custom-validators';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    minLength: 'Must be at least {{requiredLength}} characters',
    maxLength: 'Must be no more than {{requiredLength}} characters',
  },
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      required: true,
      minLength: 3,
      maxLength: 20,
      validators: [
        {
          type: 'customHttp',
          functionName: 'checkUsernameAvailability',
        },
      ],
      validationMessages: {
        usernameTaken: 'This username is already taken',
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
  title: 'Multiple Validators',
  description: 'Combined Sync and Async Validation',
  config,
  customFnConfig: {
    httpValidators: {
      checkUsernameAvailability,
    },
  },
};
