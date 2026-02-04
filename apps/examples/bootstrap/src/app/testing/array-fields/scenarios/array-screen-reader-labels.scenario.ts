import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const createContact = (name: string, phone: string) =>
  ({
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
            value: name,
          },
          {
            key: 'phone',
            type: 'input',
            label: 'Phone Number',
            col: 6,
            value: phone,
          },
        ],
      },
    ],
  }) as const;

const config = {
  fields: [
    {
      key: 'contacts',
      type: 'array',
      fields: [[createContact('Alice', '555-0001')], [createContact('Bob', '555-0002')]],
    },
    {
      key: 'addContact',
      type: 'addArrayItem',
      arrayKey: 'contacts',
      label: 'Add Contact',
      props: { variant: 'primary' },
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
      props: { variant: 'danger' },
    },
  ],
} as const satisfies FormConfig;

export const arrayScreenReaderLabelsScenario: TestScenario = {
  testId: 'array-screen-reader-labels',
  title: 'Screen Reader Labels',
  description: 'Test ARIA attributes and screen reader accessibility for array fields',
  config,
};
