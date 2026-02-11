import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test state preservation for conditional fields inside groups.
 * Tests logic on fields inside the container.
 * Note: containers also support `logic: [{ type: 'hidden' }]` directly.
 */
const config = {
  fields: [
    {
      key: 'includeAddress',
      type: 'checkbox',
      label: 'Include Address',
      value: false,
    },
    {
      key: 'address',
      type: 'group',
      fields: [
        {
          key: 'street',
          type: 'input',
          label: 'Street',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'includeAddress',
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
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'includeAddress',
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
          key: 'state',
          type: 'select',
          label: 'State',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'includeAddress',
                operator: 'equals',
                value: false,
              },
            },
          ],
          options: [
            { value: 'CA', label: 'California' },
            { value: 'NY', label: 'New York' },
            { value: 'TX', label: 'Texas' },
            { value: 'FL', label: 'Florida' },
          ],
        },
        {
          key: 'zipCode',
          type: 'input',
          label: 'ZIP Code',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'includeAddress',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter ZIP code',
          },
        },
      ],
    },
    {
      key: 'includeBilling',
      type: 'checkbox',
      label: 'Include Billing Address',
      value: false,
    },
    {
      key: 'billing',
      type: 'group',
      fields: [
        {
          key: 'billingStreet',
          type: 'input',
          label: 'Billing Street',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'includeBilling',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter billing street',
          },
        },
        {
          key: 'billingCity',
          type: 'input',
          label: 'Billing City',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'includeBilling',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter billing city',
          },
        },
        {
          key: 'billingZip',
          type: 'input',
          label: 'Billing ZIP',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'includeBilling',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter billing ZIP',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const groupStatePreservationScenario: TestScenario = {
  testId: 'group-state-preservation',
  title: 'Group State Preservation',
  description: 'Verify that values in conditionally hidden group fields are preserved when toggled',
  config,
};
