import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'userId',
      type: 'input',
      label: 'User ID',
      value: 'user-1',
      col: 12,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      required: true,
      validators: [
        {
          type: 'http',
          http: {
            url: '/api/users/:userId/check-email',
            params: { userId: 'formValue.userId' },
            queryParams: { email: 'fieldValue' },
          },
          responseMapping: {
            validWhen: 'response.available',
            errorKind: 'emailTaken',
          },
        },
      ],
      validationMessages: {
        emailTaken: 'This email is already in use',
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

export const validatorPathParamsScenario: TestScenario = {
  testId: 'validator-path-params-test',
  title: 'HTTP Validator with Path Params',
  description: 'Uniqueness check using HTTP validator with URL path parameter and query parameter combined',
  config,
};
