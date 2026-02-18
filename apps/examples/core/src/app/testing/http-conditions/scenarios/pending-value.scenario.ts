import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'query',
      type: 'input',
      label: 'Query',
      value: '',
      col: 12,
    },
    {
      key: 'result',
      type: 'input',
      label: 'Result Field',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'http',
            http: {
              url: '/api/slow-check',
              queryParams: {
                q: 'formValue.query',
              },
              debounceMs: 100,
            },
            responseExpression: 'response.shouldHide',
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

export const pendingValueScenario: TestScenario = {
  testId: 'pending-value-test',
  title: 'Pending Value Behavior',
  description: 'Verifies pendingValue controls field state while HTTP request is in-flight',
  config,
};
