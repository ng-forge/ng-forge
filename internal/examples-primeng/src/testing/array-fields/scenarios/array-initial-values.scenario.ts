import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'contacts',
      type: 'array',
      fields: [
        [
          {
            key: 'contactRow',
            type: 'row',
            fields: [
              {
                key: 'name',
                type: 'input',
                label: 'Name',
                col: 6,
                value: 'Alice',
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                col: 6,
                value: 'alice@example.com',
              },
            ],
          },
        ],
        [
          {
            key: 'contactRow',
            type: 'row',
            fields: [
              {
                key: 'name',
                type: 'input',
                label: 'Name',
                col: 6,
                value: 'Bob',
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                col: 6,
                value: 'bob@example.com',
              },
            ],
          },
        ],
      ],
    },
  ],
} as const satisfies FormConfig;

export const arrayInitialValuesScenario: TestScenario = {
  testId: 'array-initial-values',
  title: 'Initial Values',
  description: 'Display array fields with predefined values',
  config,
};
