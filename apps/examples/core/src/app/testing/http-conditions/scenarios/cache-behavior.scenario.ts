import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'option',
      type: 'select',
      label: 'Option',
      value: '',
      options: [
        { label: 'Option A', value: 'A' },
        { label: 'Option B', value: 'B' },
      ],
      col: 12,
    },
    {
      key: 'detail',
      type: 'input',
      label: 'Detail Field',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'http',
            http: {
              url: '/api/cache-test',
              queryParams: {
                option: 'formValue.option',
              },
            },
            responseExpression: 'response.shouldHide',
            pendingValue: false,
            cacheDurationMs: 60000,
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

export const cacheBehaviorScenario: TestScenario = {
  testId: 'cache-behavior-test',
  title: 'Response Caching',
  description: 'Verifies HTTP responses are cached and reused for identical requests',
  config,
};
