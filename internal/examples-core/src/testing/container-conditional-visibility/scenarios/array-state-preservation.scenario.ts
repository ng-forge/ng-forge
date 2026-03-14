import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test state preservation for conditional fields inside arrays.
 * Tests logic on fields inside the container.
 * Note: containers also support `logic: [{ type: 'hidden' }]` directly.
 */
const contactRowFields = [
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
];

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
      fields: [contactRowFields, contactRowFields],
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
      template: contactRowFields,
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
} as FormConfig;

export const arrayStatePreservationScenario: TestScenario = {
  testId: 'array-state-preservation',
  title: 'Array State Preservation',
  description: 'Verify that values in conditionally hidden array fields are preserved when toggled',
  config,
};
