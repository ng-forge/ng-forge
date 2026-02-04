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
            key: 'userRow',
            type: 'row',
            fields: [
              {
                key: 'user',
                type: 'group',
                fields: [
                  {
                    key: 'firstName',
                    type: 'input',
                    label: 'First Name',
                    col: 6,
                    value: '',
                  },
                  {
                    key: 'lastName',
                    type: 'input',
                    label: 'Last Name',
                    col: 6,
                    value: '',
                  },
                  {
                    key: 'role',
                    type: 'select',
                    label: 'Role',
                    options: [
                      { value: 'admin', label: 'Admin' },
                      { value: 'user', label: 'User' },
                    ],
                    value: '',
                  },
                ],
              },
            ],
          },
        ],
      ],
    },
    {
      key: 'addUserButton',
      type: 'addArrayItem',
      arrayKey: 'users',
      label: 'Add User',
      className: 'array-add-button',
      template: [
        {
          key: 'userRow',
          type: 'row',
          fields: [
            {
              key: 'user',
              type: 'group',
              fields: [
                {
                  key: 'firstName',
                  type: 'input',
                  label: 'First Name',
                  col: 6,
                },
                {
                  key: 'lastName',
                  type: 'input',
                  label: 'Last Name',
                  col: 6,
                },
                {
                  key: 'role',
                  type: 'select',
                  label: 'Role',
                  options: [
                    { value: 'admin', label: 'Admin' },
                    { value: 'user', label: 'User' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const arrayNestedScenario: TestScenario = {
  testId: 'array-nested',
  title: 'Nested Fields',
  description: 'Test nested group fields within array fields',
  config,
};
