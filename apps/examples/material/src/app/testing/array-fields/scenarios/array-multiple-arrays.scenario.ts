import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'emails',
      type: 'array',
      fields: [
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          props: { type: 'email' },
        },
      ],
    },
    {
      key: 'addEmail',
      type: 'addArrayItem',
      arrayKey: 'emails',
      label: 'Add Email',
      props: { color: 'primary' },
    },
    {
      key: 'removeEmail',
      type: 'removeArrayItem',
      arrayKey: 'emails',
      label: 'Remove Email',
    },
    {
      key: 'phones',
      type: 'array',
      fields: [
        {
          key: 'phone',
          type: 'input',
          label: 'Phone',
          props: { type: 'tel' },
        },
      ],
    },
    {
      key: 'addPhone',
      type: 'addArrayItem',
      arrayKey: 'phones',
      label: 'Add Phone',
      props: { color: 'primary' },
    },
    {
      key: 'removePhone',
      type: 'removeArrayItem',
      arrayKey: 'phones',
      label: 'Remove Phone',
    },
  ],
} as const satisfies FormConfig;

export const arrayMultipleArraysScenario: TestScenario = {
  testId: 'array-multiple-arrays',
  title: 'Multiple Independent Arrays',
  description: 'Verify operations on one array do not affect another array in the same form',
  config,
  initialValue: {
    emails: [{ email: 'alice@example.com' }],
    phones: [{ phone: '555-0001' }],
  },
};
