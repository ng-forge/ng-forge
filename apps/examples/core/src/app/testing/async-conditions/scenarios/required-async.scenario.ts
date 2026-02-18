import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { of, delay } from 'rxjs';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      value: '',
      options: [
        { label: 'United States', value: 'US' },
        { label: 'United Kingdom', value: 'UK' },
      ],
      col: 12,
    },
    {
      key: 'taxId',
      type: 'input',
      label: 'Tax ID',
      value: '',
      logic: [
        {
          type: 'required',
          condition: {
            type: 'async',
            asyncFunctionName: 'checkTaxIdRequired',
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

export const requiredAsyncScenario: TestScenario = {
  testId: 'required-async-test',
  title: 'Required via Async',
  description: 'Field required/optional based on async condition function',
  config,
  customFnConfig: {
    asyncConditions: {
      checkTaxIdRequired: (context: EvaluationContext) => {
        const country = context.formValue.country as string;
        return of(country === 'US').pipe(delay(200));
      },
    },
  },
};
