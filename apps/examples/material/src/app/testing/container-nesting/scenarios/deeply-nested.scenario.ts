import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test deeply nested container structure: group > row > array > group.
 * The outer "organization" group contains an "orgName" input and a row
 * that wraps a "departments" array. Each department item has a "details"
 * group with name and budget fields.
 */
const config = {
  fields: [
    {
      key: 'organization',
      type: 'group',
      fields: [
        {
          key: 'orgName',
          type: 'input',
          label: 'Organization Name',
          props: { placeholder: 'Enter organization name' },
        },
        {
          key: 'deptRow',
          type: 'row',
          fields: [
            {
              key: 'departments',
              type: 'array',
              col: 12,
              fields: [
                [
                  {
                    key: 'details',
                    type: 'group',
                    fields: [
                      {
                        key: 'name',
                        type: 'input',
                        label: 'Department Name',
                        col: 6,
                        props: { placeholder: 'Enter department name' },
                      },
                      {
                        key: 'budget',
                        type: 'input',
                        label: 'Budget',
                        col: 6,
                        props: { type: 'number', placeholder: 'Enter budget' },
                      },
                    ],
                  },
                ],
              ],
            },
          ],
        },
        {
          key: 'addDepartment',
          type: 'addArrayItem',
          arrayKey: 'departments',
          label: 'Add Department',
          template: [
            {
              key: 'details',
              type: 'group',
              fields: [
                {
                  key: 'name',
                  type: 'input',
                  label: 'Department Name',
                  col: 6,
                  props: { placeholder: 'Enter department name' },
                },
                {
                  key: 'budget',
                  type: 'input',
                  label: 'Budget',
                  col: 6,
                  props: { type: 'number', placeholder: 'Enter budget' },
                },
              ],
            },
          ],
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

export const deeplyNestedScenario: TestScenario = {
  testId: 'deeply-nested',
  title: 'Deeply Nested Containers',
  description: 'Verify that deeply nested container structures (group > row > array > group) work correctly',
  config,
};
