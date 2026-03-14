import { FormConfig } from '@ng-forge/dynamic-forms';
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
            type: 'http',
            http: {
              url: '/api/tax/check',
              method: 'POST',
              body: {
                region: 'formValue.regionCode',
              },
              evaluateBodyExpressions: true,
            },
            responseExpression: '!response.taxExemptionAllowed',
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

export const disabledHttpPostScenario: TestScenario = {
  testId: 'disabled-http-post-test',
  title: 'Disabled via HTTP POST',
  description: 'Field disabled/enabled based on HTTP POST response with body expressions',
  config,
};
