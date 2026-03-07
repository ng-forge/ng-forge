import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test state preservation for conditional fields inside rows.
 * Tests logic on fields inside the container.
 * Note: containers also support `logic: [{ type: 'hidden' }]` directly.
 */
const config = {
  fields: [
    {
      key: 'enableAddress',
      type: 'checkbox',
      label: 'Enable Address',
      value: false,
    },
    {
      key: 'addressRow',
      type: 'row',
      fields: [
        {
          key: 'street',
          type: 'input',
          label: 'Street',
          col: 6,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'enableAddress',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter street address',
          },
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          col: 3,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'enableAddress',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter city',
          },
        },
        {
          key: 'zipCode',
          type: 'input',
          label: 'ZIP Code',
          col: 3,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'enableAddress',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter ZIP',
          },
        },
      ],
    },
    {
      key: 'enablePhone',
      type: 'checkbox',
      label: 'Enable Phone',
      value: false,
    },
    {
      key: 'phoneRow',
      type: 'row',
      fields: [
        {
          key: 'phoneType',
          type: 'select',
          label: 'Phone Type',
          col: 4,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'enablePhone',
                operator: 'equals',
                value: false,
              },
            },
          ],
          options: [
            { value: 'mobile', label: 'Mobile' },
            { value: 'home', label: 'Home' },
            { value: 'work', label: 'Work' },
          ],
        },
        {
          key: 'phoneNumber',
          type: 'input',
          label: 'Phone Number',
          col: 8,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'enablePhone',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter phone number',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const rowStatePreservationScenario: TestScenario = {
  testId: 'row-state-preservation',
  title: 'Row State Preservation',
  description: 'Verify that values in conditionally hidden row fields are preserved when toggled',
  config,
};
