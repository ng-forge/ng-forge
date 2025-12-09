import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'contacts',
      type: 'array',
      fields: [
        {
          key: 'contactRow',
          type: 'row',
          fields: [
            {
              key: 'name',
              type: 'input',
              label: 'Name',
              col: 6,
            },
            {
              key: 'email',
              type: 'input',
              label: 'Email',
              col: 6,
            },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const arrayInitialValuesScenario: TestScenario = {
  testId: 'array-initial-values',
  title: 'Initial Values',
  description: 'Display array fields with predefined values',
  config,
  initialValue: {
    contacts: [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ],
  },
};
