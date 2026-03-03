import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { throwError } from 'rxjs';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'trigger',
      type: 'input',
      label: 'Trigger',
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
            asyncFunctionName: 'alwaysFails',
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

export const asyncErrorFallbackScenario: TestScenario = {
  testId: 'async-error-fallback-test',
  title: 'Async Error Fallback',
  description: 'When async condition function errors, field uses pendingValue as fallback',
  config,
  customFnConfig: {
    asyncConditions: {
      alwaysFails: (_context: EvaluationContext) => {
        return throwError(() => new Error('Simulated error'));
      },
    },
  },
};
