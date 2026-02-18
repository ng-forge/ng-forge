import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'currency',
      type: 'select',
      label: 'Currency',
      value: '',
      options: [
        { label: 'Euro (EUR)', value: 'EUR' },
        { label: 'British Pound (GBP)', value: 'GBP' },
      ],
      col: 6,
    },
    {
      key: 'exchangeRate',
      type: 'input',
      label: 'Exchange Rate',
      readonly: true,
      props: { type: 'number' },
      col: 6,
      logic: [
        {
          type: 'derivation',
          source: 'http',
          http: {
            url: '/api/rates/:currency',
            params: { currency: 'formValue.currency' },
          },
          responseExpression: 'response.rate',
          dependsOn: ['currency'],
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const derivationPathParamsScenario: TestScenario = {
  testId: 'derivation-path-params-test',
  title: 'HTTP Derivation with Path Params',
  description: 'Derived value from HTTP response using URL path parameter interpolation',
  config,
};
