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
                key: 'contact',
                type: 'group',
                fields: [
                  {
                    key: 'name',
                    type: 'input',
                    label: 'Contact Name',
                    col: 6,
                    value: 'Alice',
                  },
                  {
                    key: 'phone',
                    type: 'input',
                    label: 'Phone Number',
                    col: 6,
                    value: '555-0001',
                  },
                ],
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
                key: 'contact',
                type: 'group',
                fields: [
                  {
                    key: 'name',
                    type: 'input',
                    label: 'Contact Name',
                    col: 6,
                    value: 'Bob',
                  },
                  {
                    key: 'phone',
                    type: 'input',
                    label: 'Phone Number',
                    col: 6,
                    value: '555-0002',
                  },
                ],
              },
            ],
          },
        ],
      ],
    },
    {
      key: 'addContact',
      type: 'addArrayItem',
      arrayKey: 'contacts',
      label: 'Add Contact',
      props: { severity: 'primary' },
      template: [
        {
          key: 'contactRow',
          type: 'row',
          fields: [
            {
              key: 'contact',
              type: 'group',
              fields: [
                {
                  key: 'name',
                  type: 'input',
                  label: 'Contact Name',
                  col: 6,
                },
                {
                  key: 'phone',
                  type: 'input',
                  label: 'Phone Number',
                  col: 6,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: 'removeContact',
      type: 'removeArrayItem',
      arrayKey: 'contacts',
      label: 'Remove Last Contact',
      props: { severity: 'danger' },
    },
  ],
} as const satisfies FormConfig;

export const arrayScreenReaderLabelsScenario: TestScenario = {
  testId: 'array-screen-reader-labels',
  title: 'Screen Reader Labels',
  description: 'Test ARIA attributes and screen reader accessibility for array fields',
  config,
};
