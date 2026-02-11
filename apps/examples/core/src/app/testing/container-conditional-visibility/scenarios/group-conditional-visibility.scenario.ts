import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test conditional visibility of fields INSIDE a group.
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
      ],
      value: 'personal',
    },
    {
      key: 'businessDetails',
      type: 'group',
      fields: [
        {
          key: 'companyName',
          type: 'input',
          label: 'Company Name',
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
        {
          key: 'employeeCount',
          type: 'select',
          label: 'Employee Count',
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
          options: [
            { value: '1-10', label: '1-10' },
            { value: '11-50', label: '11-50' },
            { value: '51-200', label: '51-200' },
            { value: '200+', label: '200+' },
          ],
        },
      ],
    },
    {
      key: 'commonField',
      type: 'input',
      label: 'Email',
      props: {
        type: 'email',
        placeholder: 'Enter email address',
      },
    },
  ],
} as const satisfies FormConfig;

export const groupConditionalVisibilityScenario: TestScenario = {
  testId: 'group-conditional-visibility',
  title: 'Group with Conditional Fields',
  description: 'Verify that fields inside a group can be shown/hidden based on field values',
  config,
};
