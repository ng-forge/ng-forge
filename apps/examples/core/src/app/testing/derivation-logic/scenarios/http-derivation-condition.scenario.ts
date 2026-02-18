import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'enableLookup',
      type: 'toggle',
      label: 'Enable City Lookup',
      value: false,
      col: 12,
    },
    {
      key: 'zipCode',
      type: 'input',
      label: 'Zip Code',
      col: 6,
    },
    {
      key: 'city',
      type: 'input',
      label: 'City',
      readonly: true,
      col: 6,
      logic: [
        {
          type: 'derivation',
          source: 'http',
          http: {
            url: '/api/lookup-city',
            method: 'GET',
            queryParams: { zip: 'formValue.zipCode' },
          },
          responseExpression: 'response.city',
          dependsOn: ['zipCode'],
          condition: { type: 'fieldValue', fieldPath: 'enableLookup', operator: 'equals', value: true },
        },
      ],
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

export const httpDerivationConditionScenario: TestScenario = {
  testId: 'http-derivation-condition-test',
  title: 'HTTP Derivation Condition',
  description: 'Tests that HTTP derivation respects condition expressions that dynamically enable/disable the HTTP call',
  config,
};
