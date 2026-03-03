import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'search',
      type: 'input',
      label: 'Search Term',
      value: '',
      col: 12,
    },
    {
      key: 'result',
      type: 'input',
      label: 'Search Result',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'http',
            http: {
              url: '/api/debounce-test',
              queryParams: {
                q: 'formValue.search',
              },
            },
            debounceMs: 500,
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

export const debounceCoalescingScenario: TestScenario = {
  testId: 'debounce-coalescing-test',
  title: 'Debounce Coalescing',
  description: 'Verifies rapid input changes coalesce into fewer HTTP requests via debounceMs',
  config,
};
