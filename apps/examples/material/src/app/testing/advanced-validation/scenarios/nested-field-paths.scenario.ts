import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests deeply nested field paths in cross-field validation and logic.
 * Verifies that validators and conditions can reference nested paths like
 * `formValue.address.zip` or `formValue.contact.email`.
 *
 * Note: Groups cannot be nested within groups (GroupAllowedChildren constraint),
 * so we use row > group > fields pattern for nesting.
 *
 * This tests the getNestedValue utility and path resolution in:
 * - Cross-field validators with nested formValue references
 * - Logic conditions referencing nested field paths
 * - Expression-based validators with nested paths
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'addressRow',
      type: 'row',
      fields: [
        {
          key: 'address',
          type: 'group',
          fields: [
            {
              key: 'billingZip',
              type: 'input',
              label: 'Billing Zip Code',
              value: '12345',
              col: 6,
            },
            {
              key: 'billingCountry',
              type: 'select',
              label: 'Billing Country',
              options: [
                { label: 'United States', value: 'US' },
                { label: 'Canada', value: 'CA' },
                { label: 'United Kingdom', value: 'UK' },
              ],
              value: 'US',
              col: 6,
            },
          ],
        },
      ],
    },
    {
      key: 'sameAsBilling',
      type: 'checkbox',
      label: 'Shipping address same as billing',
      value: false,
      col: 12,
    },
    {
      key: 'shippingZip',
      type: 'input',
      label: 'Shipping Zip Code (must match billing when not same)',
      value: '12345',
      validators: [
        {
          type: 'custom',
          // Cross-field validation with nested path
          expression: 'sameAsBilling || fieldValue === formValue.address.billingZip',
          kind: 'zipMismatch',
        },
      ],
      validationMessages: {
        zipMismatch: 'Shipping zip must match billing zip',
      },
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'equals',
            value: true,
          },
        },
      ],
      col: 6,
    },
    {
      key: 'contactRow',
      type: 'row',
      fields: [
        {
          key: 'contact',
          type: 'group',
          fields: [
            {
              key: 'primaryEmail',
              type: 'input',
              label: 'Primary Email',
              value: 'primary@example.com',
              required: true,
              col: 6,
            },
            {
              key: 'primaryPhone',
              type: 'input',
              label: 'Primary Phone',
              col: 6,
            },
          ],
        },
      ],
    },
    {
      key: 'secondaryEmail',
      type: 'input',
      label: 'Secondary Email (must differ from primary)',
      validators: [
        {
          type: 'custom',
          // Validator referencing nested path
          expression: '!fieldValue || fieldValue !== formValue.contact.primaryEmail',
          kind: 'duplicateEmail',
        },
      ],
      validationMessages: {
        duplicateEmail: 'Secondary email must be different from primary email',
      },
      col: 6,
    },
    {
      key: 'settingsRow',
      type: 'row',
      fields: [
        {
          key: 'settings',
          type: 'group',
          fields: [
            {
              key: 'emailNotifications',
              type: 'checkbox',
              label: 'Email Notifications',
              value: true,
            },
            {
              key: 'smsNotifications',
              type: 'checkbox',
              label: 'SMS Notifications',
              value: false,
            },
          ],
        },
      ],
    },
    {
      key: 'phoneForSms',
      type: 'input',
      label: 'Phone number (required for SMS)',
      validators: [
        {
          type: 'custom',
          // Safe property access is built-in - accessing null.property returns undefined
          expression: '!formValue.settings.smsNotifications || !!fieldValue',
          kind: 'phoneRequired',
        },
      ],
      validationMessages: {
        phoneRequired: 'Phone number is required when SMS notifications are enabled',
      },
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'javascript',
            // Safe property access is built-in - accessing null.property returns undefined
            expression: '!formValue.settings.smsNotifications',
          },
        },
      ],
      col: 6,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const nestedFieldPathsScenario: TestScenario = {
  testId: 'nested-field-paths-test',
  title: 'Nested Field Paths',
  description: 'Tests cross-field validation and logic with nested field paths (e.g., formValue.address.billingZip)',
  config,
};
