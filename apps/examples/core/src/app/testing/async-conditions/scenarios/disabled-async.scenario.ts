import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { of, delay } from 'rxjs';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'regionCode',
      type: 'input',
      label: 'Region Code',
      value: '',
      col: 12,
    },
    {
      key: 'taxExemption',
      type: 'input',
      label: 'Tax Exemption ID',
      value: '',
      logic: [
        {
          type: 'disabled',
          condition: {
            type: 'async',
            asyncFunctionName: 'checkDisabled',
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

export const disabledAsyncScenario: TestScenario = {
  testId: 'disabled-async-test',
  title: 'Disabled via Async',
  description: 'Field disabled/enabled based on async condition function',
  config,
  customFnConfig: {
    asyncConditions: {
      checkDisabled: (context: EvaluationContext) => {
        const region = context.formValue.regionCode as string;
        return of(region !== 'US-CA').pipe(delay(200));
      },
    },
  },
};
