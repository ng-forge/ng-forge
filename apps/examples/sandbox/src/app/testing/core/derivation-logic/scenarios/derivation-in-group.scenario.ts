import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'person',
      type: 'group',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          col: 4,
          props: { placeholder: 'Enter first name' },
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          col: 4,
          props: { placeholder: 'Enter last name' },
        },
        {
          key: 'fullName',
          type: 'input',
          label: 'Full Name (Derived)',
          readonly: true,
          col: 4,
          derivation: 'formValue.firstName + " " + formValue.lastName',
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

export const derivationInGroupScenario: TestScenario = {
  testId: 'derivation-in-group',
  title: 'Derivation Inside Group',
  description: 'Tests that derivation works for fields inside a group container',
  config,
};
