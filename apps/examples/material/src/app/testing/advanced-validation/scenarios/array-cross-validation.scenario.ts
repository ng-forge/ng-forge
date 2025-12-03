import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests array field validation scenarios.
 * Covers:
 * - Individual array item validation (required, email, etc.)
 * - Cross-field validation within array items (referencing formValue)
 * - Conditional validation for array items based on external field values
 *
 * Note: Array-level validation (min/max items, unique values) is not yet implemented.
 * This scenario focuses on item-level validation that references the root form.
 */
const config = {
  fields: [
    {
      key: 'requireEmail',
      type: 'checkbox',
      label: 'Require email for all contacts',
      value: false,
      col: 6,
    },
    {
      key: 'defaultDomain',
      type: 'input',
      label: 'Default Email Domain (e.g., company.com)',
      value: 'company.com',
      col: 6,
    },
    {
      key: 'contacts',
      type: 'array',
      fields: [
        {
          key: 'contactRow',
          type: 'row',
          fields: [
            {
              key: 'contact',
              type: 'group',
              fields: [
                {
                  key: 'name',
                  type: 'input',
                  label: 'Name',
                  required: true,
                  col: 4,
                },
                {
                  key: 'email',
                  type: 'input',
                  label: 'Email',
                  email: true,
                  validators: [
                    {
                      // Conditionally required based on root form field
                      type: 'custom',
                      expression: '!formValue.requireEmail || !!fieldValue',
                      kind: 'required',
                      when: {
                        type: 'fieldValue',
                        fieldPath: 'requireEmail',
                        operator: 'equals',
                        value: true,
                      },
                    },
                    {
                      // Validate email contains the default domain from root form
                      type: 'custom',
                      expression: '!fieldValue || String(fieldValue).endsWith("@" + formValue.defaultDomain)',
                      kind: 'domainMismatch',
                      when: {
                        type: 'javascript',
                        expression: '!!formValue.defaultDomain && !!fieldValue',
                      },
                    },
                  ],
                  validationMessages: {
                    email: 'Please enter a valid email address',
                    required: 'Email is required when checkbox is checked',
                    domainMismatch: 'Email must use the company domain',
                  },
                  col: 4,
                },
                {
                  key: 'role',
                  type: 'select',
                  label: 'Role',
                  options: [
                    { label: 'Admin', value: 'admin' },
                    { label: 'User', value: 'user' },
                    { label: 'Guest', value: 'guest' },
                  ],
                  value: 'user',
                  col: 4,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: 'addContactButton',
      type: 'addArrayItem',
      arrayKey: 'contacts',
      label: 'Add Contact',
      className: 'array-add-button',
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const arrayCrossValidationScenario: TestScenario = {
  testId: 'array-cross-validation-test',
  title: 'Array Cross-Validation',
  description: 'Tests validation within array items that references root form fields (conditional required, domain validation)',
  config,
  initialValue: {
    requireEmail: false,
    defaultDomain: 'company.com',
    contacts: [{ contact: { name: '', email: '', role: 'user' } }],
  },
};
