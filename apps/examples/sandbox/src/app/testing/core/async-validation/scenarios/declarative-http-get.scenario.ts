import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Declarative HTTP GET validator scenario — fully JSON-serializable, no function registration.
 * Uses `type: 'http'` with `HttpRequestConfig` and `HttpValidationResponseMapping`.
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
            url: '/api/users/check-availability',
            method: 'GET',
            queryParams: {
              username: 'fieldValue',
            },
          },
          responseMapping: {
            validWhen: 'response.available',
            errorKind: 'usernameTaken',
            errorParams: {
              suggestion: 'response.suggestion',
            },
          },
        },
      ],
      validationMessages: {
        usernameTaken: 'Username is taken. Try {{suggestion}}',
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

export const declarativeHttpGetScenario: TestScenario = {
  testId: 'declarative-http-get-test',
  title: 'Declarative HTTP GET Validator',
  description: 'Username availability check using declarative HTTP validator (no function registration)',
  config,
};
