import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'userRole',
      type: 'select',
      label: 'User Role',
      value: '',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Viewer', value: 'viewer' },
      ],
      col: 12,
    },
    {
      key: 'adminPanel',
      type: 'input',
      label: 'Admin Panel Access Code',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'http',
            http: {
              url: '/api/permissions',
              queryParams: {
                role: 'formValue.userRole',
              },
            },
            responseExpression: 'response.hideAdminPanel',
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

export const hiddenHttpGetScenario: TestScenario = {
  testId: 'hidden-http-get-test',
  title: 'Hidden via HTTP GET',
  description: 'Field hidden/shown based on HTTP GET response with query params derived from form values',
  config,
};
