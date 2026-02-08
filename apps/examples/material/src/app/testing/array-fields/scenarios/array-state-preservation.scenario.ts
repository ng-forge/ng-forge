import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test state preservation for conditional fields inside arrays.
 * Note: Arrays themselves don't support logic - they're data containers.
 * This test verifies that values in conditionally hidden fields are preserved.
 */
const config = {
  fields: [
    {
      key: 'enableContacts',
      type: 'checkbox',
      label: 'Enable Contacts List',
      value: false,
    },
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
                label: 'Contact Name',
                col: 4,
                logic: [
                  {
                    type: 'hidden',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'enableContacts',
                      operator: 'equals',
                      value: false,
                    },
                  },
                ],
                props: {
                  placeholder: 'Enter name',
                },
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                col: 4,
                logic: [
                  {
                    type: 'hidden',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'enableContacts',
                      operator: 'equals',
                      value: false,
                    },
                  },
                ],
                props: {
                  type: 'email',
                  placeholder: 'Enter email',
                },
              },
              {
                key: 'phone',
                type: 'input',
                label: 'Phone',
                col: 4,
                logic: [
                  {
                    type: 'hidden',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'enableContacts',
                      operator: 'equals',
                      value: false,
                    },
                  },
                ],
                props: {
                  placeholder: 'Enter phone',
                },
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
                label: 'Contact Name',
                col: 4,
                logic: [
                  {
                    type: 'hidden',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'enableContacts',
                      operator: 'equals',
                      value: false,
                    },
                  },
                ],
                props: {
                  placeholder: 'Enter name',
                },
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                col: 4,
                logic: [
                  {
                    type: 'hidden',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'enableContacts',
                      operator: 'equals',
                      value: false,
                    },
                  },
                ],
                props: {
                  type: 'email',
                  placeholder: 'Enter email',
                },
              },
              {
                key: 'phone',
                type: 'input',
                label: 'Phone',
                col: 4,
                logic: [
                  {
                    type: 'hidden',
                    condition: {
                      type: 'fieldValue',
                      fieldPath: 'enableContacts',
                      operator: 'equals',
                      value: false,
                    },
                  },
                ],
                props: {
                  placeholder: 'Enter phone',
                },
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
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'enableContacts',
            operator: 'equals',
            value: false,
          },
        },
      ],
      template: [
        {
          key: 'contactRow',
          type: 'row',
          fields: [
            {
              key: 'name',
              type: 'input',
              label: 'Contact Name',
              col: 4,
              logic: [
                {
                  type: 'hidden',
                  condition: {
                    type: 'fieldValue',
                    fieldPath: 'enableContacts',
                    operator: 'equals',
                    value: false,
                  },
                },
              ],
              props: {
                placeholder: 'Enter name',
              },
            },
            {
              key: 'email',
              type: 'input',
              label: 'Email',
              col: 4,
              logic: [
                {
                  type: 'hidden',
                  condition: {
                    type: 'fieldValue',
                    fieldPath: 'enableContacts',
                    operator: 'equals',
                    value: false,
                  },
                },
              ],
              props: {
                type: 'email',
                placeholder: 'Enter email',
              },
            },
            {
              key: 'phone',
              type: 'input',
              label: 'Phone',
              col: 4,
              logic: [
                {
                  type: 'hidden',
                  condition: {
                    type: 'fieldValue',
                    fieldPath: 'enableContacts',
                    operator: 'equals',
                    value: false,
                  },
                },
              ],
              props: {
                placeholder: 'Enter phone',
              },
            },
          ],
        },
      ],
    },
    {
      key: 'alwaysVisibleField',
      type: 'input',
      label: 'Always Visible',
      props: {
        placeholder: 'This field is always visible',
      },
    },
  ],
} as const satisfies FormConfig;

export const arrayStatePreservationScenario: TestScenario = {
  testId: 'array-state-preservation',
  title: 'Array State Preservation',
  description: 'Verify that values in conditionally hidden array fields are preserved when toggled',
  config,
};
