import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'emails',
      type: 'array',
      fields: [
        [
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
      key: 'addEmailButton',
      type: 'addArrayItem',
      arrayKey: 'emails',
      label: 'Add Email',
      className: 'array-add-button',
      props: { variant: 'primary' },
      template: [
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          props: { type: 'email' },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const arrayAddScenario: TestScenario = {
  testId: 'array-add',
  title: 'Add Array Items',
  description: 'Add new email addresses to the array field',
  config,
};
