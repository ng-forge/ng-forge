import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'userId',
      type: 'select',
      label: 'User',
      value: '',
      options: [
        { label: 'Alice (admin)', value: 'alice' },
        { label: 'Bob (viewer)', value: 'bob' },
      ],
      col: 12,
    },
    {
      key: 'adminSettings',
      type: 'input',
      label: 'Admin Settings',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'http',
            http: {
              url: '/api/users/:userId/permissions',
              params: { userId: 'formValue.userId' },
            },
            responseExpression: 'response.hideAdmin',
            pendingValue: true,
          },
        },
      ],
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

export const conditionPathParamsScenario: TestScenario = {
  testId: 'condition-path-params-test',
  title: 'HTTP Condition with Path Params',
  description: 'Field hidden/shown based on HTTP response using URL path parameter interpolation',
  config,
};
