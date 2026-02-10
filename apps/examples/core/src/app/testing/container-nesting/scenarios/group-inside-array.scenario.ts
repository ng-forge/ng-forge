import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test group fields nested inside array items.
 * The "employees" array has items containing an "employeeName" input
 * and an "address" group with street and city fields.
 */
const config = {
  fields: [
    {
      key: 'employees',
      type: 'array',
      fields: [
        [
          {
            key: 'employeeName',
            type: 'input',
            label: 'Employee Name',
            props: { placeholder: 'Enter employee name' },
          },
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'street',
                type: 'input',
                label: 'Street',
                col: 6,
                props: { placeholder: 'Enter street' },
              },
              {
                key: 'city',
                type: 'input',
                label: 'City',
                col: 6,
                props: { placeholder: 'Enter city' },
              },
            ],
          },
        ],
      ],
    },
    {
      key: 'addEmployee',
      type: 'addArrayItem',
      arrayKey: 'employees',
      label: 'Add Employee',
      template: [
        {
          key: 'employeeName',
          type: 'input',
          label: 'Employee Name',
          props: { placeholder: 'Enter employee name' },
        },
        {
          key: 'address',
          type: 'group',
          fields: [
            {
              key: 'street',
              type: 'input',
              label: 'Street',
              col: 6,
              props: { placeholder: 'Enter street' },
            },
            {
              key: 'city',
              type: 'input',
              label: 'City',
              col: 6,
              props: { placeholder: 'Enter city' },
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

export const groupInsideArrayScenario: TestScenario = {
  testId: 'group-inside-array',
  title: 'Group Inside Array',
  description: 'Verify that group fields work correctly when nested inside array items',
  config,
};
