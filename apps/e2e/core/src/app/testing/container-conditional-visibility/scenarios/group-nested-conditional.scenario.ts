import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test nested conditional fields inside a group.
 * Tests logic on fields inside the container.
 * Note: containers also support `logic: [{ type: 'hidden' }]` directly.
 */
const config = {
  fields: [
    {
      key: 'showPersonal',
      type: 'checkbox',
      label: 'Show Personal Information',
      value: true,
    },
    {
      key: 'personal',
      type: 'group',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'showPersonal',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter first name',
          },
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'showPersonal',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter last name',
          },
        },
        {
          key: 'hasMiddleName',
          type: 'checkbox',
          label: 'Has Middle Name',
          value: false,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'showPersonal',
                operator: 'equals',
                value: false,
              },
            },
          ],
        },
        {
          key: 'middleName',
          type: 'input',
          label: 'Middle Name',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'and',
                conditions: [
                  {
                    type: 'fieldValue',
                    fieldPath: 'showPersonal',
                    operator: 'equals',
                    value: true,
                  },
                  {
                    type: 'fieldValue',
                    fieldPath: 'personal.hasMiddleName',
                    operator: 'equals',
                    value: false,
                  },
                ],
              },
            },
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'showPersonal',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter middle name',
          },
        },
        {
          key: 'contactMethod',
          type: 'radio',
          label: 'Preferred Contact Method',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
          ],
          value: 'email',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'showPersonal',
                operator: 'equals',
                value: false,
              },
            },
          ],
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'or',
                conditions: [
                  {
                    type: 'fieldValue',
                    fieldPath: 'showPersonal',
                    operator: 'equals',
                    value: false,
                  },
                  {
                    type: 'fieldValue',
                    fieldPath: 'personal.contactMethod',
                    operator: 'notEquals',
                    value: 'email',
                  },
                ],
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
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'or',
                conditions: [
                  {
                    type: 'fieldValue',
                    fieldPath: 'showPersonal',
                    operator: 'equals',
                    value: false,
                  },
                  {
                    type: 'fieldValue',
                    fieldPath: 'personal.contactMethod',
                    operator: 'notEquals',
                    value: 'phone',
                  },
                ],
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

export const groupNestedConditionalScenario: TestScenario = {
  testId: 'group-nested-conditional',
  title: 'Group with Nested Conditionals',
  description: 'Verify that conditional fields inside a conditional group work correctly at both levels',
  config,
};
