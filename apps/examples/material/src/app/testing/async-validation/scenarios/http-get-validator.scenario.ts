import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      required: true,
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

export const httpGetValidatorScenario: TestScenario = {
  testId: 'http-get-validator-test',
  title: 'HTTP GET Validator',
  description: 'Check Username Availability using HTTP GET validator',
  config,
};
