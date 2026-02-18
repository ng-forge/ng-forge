import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      value: '',
      col: 12,
    },
    {
      key: 'verified',
      type: 'input',
      label: 'Verified Status',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'http',
            http: {
              url: '/api/verify-email',
              queryParams: {
                email: 'formValue.email',
              },
            },
            responseExpression: 'response.shouldHide',
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

export const httpErrorFallbackScenario: TestScenario = {
  testId: 'http-error-fallback-test',
  title: 'HTTP Error Fallback',
  description: 'Field stays visible (pendingValue: false) when HTTP request fails',
  config,
};
