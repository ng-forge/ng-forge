import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'users',
      type: 'array',
      fields: [
        [
          {
            key: 'name',
            type: 'input',
            label: 'Name',
            value: '',
          },
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            props: { type: 'email' },
            value: '',
          },
        ],
      ],
    },
    {
      key: 'addUser',
      type: 'addArrayItem',
      arrayKey: 'users',
      label: 'Add User',
      template: [
        {
          key: 'name',
          type: 'input',
          label: 'Name',
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          props: { type: 'email' },
        },
      ],
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

export const arrayDomIdUniquenessScenario: TestScenario = {
  testId: 'array-dom-id-uniqueness',
  title: 'Unique DOM IDs',
  description: 'Verify that each array item has unique DOM IDs using UUID-based key suffixes',
  config,
};
