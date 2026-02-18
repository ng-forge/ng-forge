import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { of, delay } from 'rxjs';
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
      label: 'Result',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'async',
            asyncFunctionName: 'slowCheck',
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

export const asyncPendingValueScenario: TestScenario = {
  testId: 'async-pending-value-test',
  title: 'Async Pending Value',
  description: 'Field starts in pending state (hidden) then becomes visible after async resolves',
  config,
  customFnConfig: {
    asyncConditions: {
      slowCheck: (_context: EvaluationContext) => {
        // Long delay to observe pending state; resolves to false (not hidden = visible)
        return of(false).pipe(delay(2000));
      },
    },
  },
};
