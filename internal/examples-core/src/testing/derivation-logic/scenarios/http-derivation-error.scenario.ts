import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
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

export const httpDerivationErrorScenario: TestScenario = {
  testId: 'http-derivation-error-test',
  title: 'HTTP Derivation Error Handling',
  description: 'Tests that HTTP derivation errors do not crash the form and the stream continues after errors',
  config,
};
