import { FormConfig } from '@ng-forge/dynamic-forms';
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
            type: 'http',
            http: {
              url: '/api/tax-rules',
              queryParams: {
                country: 'formValue.country',
              },
            },
            responseExpression: 'response.taxIdRequired',
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

export const requiredHttpConditionScenario: TestScenario = {
  testId: 'required-http-condition-test',
  title: 'Required via HTTP Condition',
  description: 'Field required/optional based on HTTP response with query params',
  config,
};
