import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Declarative HTTP POST validator scenario with body expressions.
 * Demonstrates `bodyExpressions: true` for expression-resolved request bodies.
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      required: true,
      validators: [
        {
          type: 'http',
          http: {
            url: '/api/users/validate-email',
            method: 'POST',
            body: {
              email: 'fieldValue',
            },
            bodyExpressions: true,
          },
          responseMapping: {
            validWhen: 'response.valid',
            errorKind: 'emailInvalid',
          },
        },
      ],
      validationMessages: {
        emailInvalid: 'This email address is not valid',
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

export const declarativeHttpPostScenario: TestScenario = {
  testId: 'declarative-http-post-test',
  title: 'Declarative HTTP POST Validator',
  description: 'Email validation using declarative HTTP POST with body expressions',
  config,
};
