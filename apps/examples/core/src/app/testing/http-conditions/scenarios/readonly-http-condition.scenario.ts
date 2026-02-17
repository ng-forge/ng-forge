import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      value: '',
      col: 12,
    },
    {
      key: 'displayName',
      type: 'input',
      label: 'Display Name',
      value: '',
      logic: [
        {
          type: 'readonly',
          condition: {
            type: 'http',
            http: {
              url: '/api/users/permissions',
              queryParams: {
                user: 'formValue.username',
              },
            },
            responseExpression: '!response.canEditDisplayName',
            pendingValue: false,
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

export const readonlyHttpConditionScenario: TestScenario = {
  testId: 'readonly-http-condition-test',
  title: 'Readonly via HTTP Condition',
  description: 'Field readonly/editable based on HTTP response checking user permissions',
  config,
};
