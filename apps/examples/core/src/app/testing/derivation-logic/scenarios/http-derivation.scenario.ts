import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'currency',
      type: 'select',
      label: 'Currency',
      options: [
        { label: 'Euro (EUR)', value: 'EUR' },
        { label: 'British Pound (GBP)', value: 'GBP' },
        { label: 'Japanese Yen (JPY)', value: 'JPY' },
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
            url: '/api/exchange-rate',
            method: 'GET',
            queryParams: { currency: 'formValue.currency' },
          },
          responseExpression: 'response.rate',
          dependsOn: ['currency'],
        },
      ],
    },
    {
      key: 'amount',
      type: 'input',
      label: 'Amount (USD)',
      value: 100,
      props: { type: 'number' },
      col: 6,
    },
    {
      key: 'convertedAmount',
      type: 'input',
      label: 'Converted Amount',
      readonly: true,
      props: { type: 'number' },
      col: 6,
      derivation: 'formValue.amount * formValue.exchangeRate',
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: { type: 'submit', color: 'primary' },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const httpDerivationScenario: TestScenario = {
  testId: 'http-derivation-test',
  title: 'HTTP Derivation',
  description: 'Tests deriving values via HTTP requests triggered by field changes, including chain derivation',
  config,
};
