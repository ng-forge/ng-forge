import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    { key: 'firstName', type: 'input', label: 'First Name', col: 6 },
    { key: 'lastName', type: 'input', label: 'Last Name', col: 6 },
    {
      key: 'displayName',
      type: 'input',
      label: 'Display Name',
      col: 12,
      logic: [
        {
          type: 'derivation',
          expression: 'formValue.firstName + " " + formValue.lastName',
          stopOnUserOverride: true,
        },
      ],
    },
    {
      key: 'greeting',
      type: 'input',
      label: 'Greeting',
      col: 12,
      logic: [
        {
          type: 'derivation',
          expression: '"Hello, " + formValue.displayName',
          stopOnUserOverride: true,
          dependsOn: ['displayName'],
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

export const stopOnUserOverrideScenario: TestScenario = {
  testId: 'stop-on-user-override-test',
  title: 'Stop On User Override',
  description: 'Tests that derivation stops running after the user manually edits the target field',
  config,
};
