import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      options: [
        { label: 'United States', value: 'US' },
        { label: 'United Kingdom', value: 'UK' },
        { label: 'Germany', value: 'DE' },
      ],
      col: 6,
    },
    {
      key: 'timezone',
      type: 'input',
      label: 'Timezone',
      col: 6,
      logic: [
        {
          type: 'derivation',
          http: {
            url: '/api/timezone',
            method: 'GET',
            queryParams: { country: 'formValue.country' },
          },
          responseExpression: 'response.timezone',
          dependsOn: ['country'],
          stopOnUserOverride: true,
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

export const httpDerivationStopOverrideScenario: TestScenario = {
  testId: 'http-derivation-stop-override-test',
  title: 'HTTP Derivation Stop On User Override',
  description: 'Tests that HTTP derivation stops after user manually edits the target field',
  config,
};
