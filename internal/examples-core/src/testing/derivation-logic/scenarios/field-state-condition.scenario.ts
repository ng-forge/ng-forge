import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    { key: 'email', type: 'input', label: 'Email', col: 12 },
    {
      key: 'emailStatus',
      type: 'input',
      label: 'Email Status',
      value: 'PRISTINE',
      readonly: true,
      col: 12,
      logic: [
        {
          type: 'derivation',
          value: 'DIRTY',
          condition: { type: 'javascript', expression: 'formFieldState.email.dirty' },
          dependsOn: ['email'],
        },
        {
          type: 'derivation',
          value: 'PRISTINE',
          condition: { type: 'javascript', expression: '!formFieldState.email.dirty' },
          dependsOn: ['email'],
        },
      ],
    },
    { key: 'username', type: 'input', label: 'Username', col: 12 },
    {
      key: 'usernameStatus',
      type: 'input',
      label: 'Username Status',
      value: 'UNTOUCHED',
      readonly: true,
      col: 12,
      logic: [
        {
          type: 'derivation',
          value: 'TOUCHED',
          condition: { type: 'javascript', expression: 'formFieldState.username.touched' },
          dependsOn: ['username'],
        },
        {
          type: 'derivation',
          value: 'UNTOUCHED',
          condition: { type: 'javascript', expression: '!formFieldState.username.touched' },
          dependsOn: ['username'],
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

export const fieldStateConditionScenario: TestScenario = {
  testId: 'field-state-condition-test',
  title: 'Field State Condition',
  description: 'Tests derivation conditions based on formFieldState (dirty, touched)',
  config,
};
