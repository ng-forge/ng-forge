import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests array field validation scenarios.
 * Covers:
 * - Individual array item validation (required, email, etc.)
 * - Cross-field validation within array items (referencing formValue)
 * - Conditional validation for array items based on external field values
 *
 * Note: String methods like endsWith/indexOf are blocked by the expression parser
 * for security reasons. This scenario focuses on conditional required validation
 * that references the root form.
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'requireEmail',
      type: 'checkbox',
      label: 'Require email for all contacts',
      value: false,
      col: 12,
    },
    {
      key: 'contacts',
      type: 'array',
      fields: [
        [
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
                    value: '',
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
                    ],
                    validationMessages: {
                      email: 'Please enter a valid email address',
                      required: 'Email is required when checkbox is checked',
                    },
                    col: 4,
                    value: '',
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
      ],
    },
    {
      key: 'addContactButton',
      type: 'addArrayItem',
      arrayKey: 'contacts',
      label: 'Add Contact',
      className: 'array-add-button',
      col: 12,
      template: [
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
                  ],
                  validationMessages: {
                    email: 'Please enter a valid email address',
                    required: 'Email is required when checkbox is checked',
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
  description: 'Tests conditional validation within array items that references root form fields',
  config,
};
