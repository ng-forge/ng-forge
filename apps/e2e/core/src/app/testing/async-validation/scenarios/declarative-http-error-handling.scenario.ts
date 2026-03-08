import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Declarative HTTP error handling scenario — tests fail-closed behavior.
 * When the HTTP request fails, declarative `type: 'http'` validators return
 * `{ kind: errorKind }` (fail-closed), unlike `customHttp` which can return null (permissive).
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      required: true,
      validators: [
        {
          type: 'http',
          http: {
            url: '/api/users/check-username',
            method: 'GET',
            queryParams: {
              username: 'fieldValue',
            },
          },
          responseMapping: {
            validWhen: 'response.available',
            errorKind: 'usernameTaken',
          },
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

export const declarativeHttpErrorHandlingScenario: TestScenario = {
  testId: 'declarative-http-error-handling-test',
  title: 'Declarative HTTP Error Handling',
  description: 'Error handling with declarative HTTP validators (fail-closed behavior)',
  config,
};
