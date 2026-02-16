import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Declarative HTTP validator with `when` condition.
 * The HTTP validation only fires when the "Check availability" checkbox is checked.
 * This tests the `when` guard on the request callback — when false, no HTTP request is made.
 */
const config = {
  fields: [
    {
      key: 'checkAvailability',
      type: 'checkbox',
      label: 'Check availability',
      value: true,
      col: 12,
    },
    {
      key: 'username',
      type: 'input',
      label: 'Username',
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
          when: {
            type: 'javascript',
            expression: 'formValue.checkAvailability === true',
          },
        },
      ],
      validationMessages: {
        usernameTaken: 'Username is already taken',
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

export const declarativeHttpConditionalScenario: TestScenario = {
  testId: 'declarative-http-conditional-test',
  title: 'Declarative HTTP Conditional Validator',
  description: 'HTTP validator with when-condition — only fires when checkbox is checked',
  config,
};
