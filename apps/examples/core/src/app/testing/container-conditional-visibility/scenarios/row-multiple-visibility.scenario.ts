import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test conditional visibility of fields across multiple rows.
 * Tests logic on fields inside the container.
 * Note: containers also support `logic: [{ type: 'hidden' }]` directly.
 */
const config = {
  fields: [
    {
      key: 'accountType',
      type: 'radio',
      label: 'Account Type',
      options: [
        { value: 'personal', label: 'Personal' },
        { value: 'business', label: 'Business' },
        { value: 'enterprise', label: 'Enterprise' },
      ],
      value: 'personal',
    },
    {
      key: 'personalRow',
      type: 'row',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          col: 6,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'notEquals',
                value: 'personal',
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
          col: 6,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'notEquals',
                value: 'personal',
              },
            },
          ],
          props: {
            placeholder: 'Enter last name',
          },
        },
      ],
    },
    {
      key: 'businessRow',
      type: 'row',
      fields: [
        {
          key: 'companyName',
          type: 'input',
          label: 'Company Name',
          col: 6,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'notEquals',
                value: 'business',
              },
            },
          ],
          props: {
            placeholder: 'Enter company name',
          },
        },
        {
          key: 'taxId',
          type: 'input',
          label: 'Tax ID',
          col: 6,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'notEquals',
                value: 'business',
              },
            },
          ],
          props: {
            placeholder: 'Enter tax ID',
          },
        },
      ],
    },
    {
      key: 'enterpriseRow',
      type: 'row',
      fields: [
        {
          key: 'corporateName',
          type: 'input',
          label: 'Corporate Name',
          col: 4,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'notEquals',
                value: 'enterprise',
              },
            },
          ],
          props: {
            placeholder: 'Enter corporate name',
          },
        },
        {
          key: 'dunsNumber',
          type: 'input',
          label: 'DUNS Number',
          col: 4,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'notEquals',
                value: 'enterprise',
              },
            },
          ],
          props: {
            placeholder: 'Enter DUNS number',
          },
        },
        {
          key: 'accountManager',
          type: 'input',
          label: 'Account Manager',
          col: 4,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'notEquals',
                value: 'enterprise',
              },
            },
          ],
          props: {
            placeholder: 'Enter account manager',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const rowMultipleVisibilityScenario: TestScenario = {
  testId: 'row-multiple-visibility',
  title: 'Multiple Rows with Cascading Visibility',
  description: 'Verify that fields in multiple rows can have independent visibility logic based on a selector field',
  config,
};
