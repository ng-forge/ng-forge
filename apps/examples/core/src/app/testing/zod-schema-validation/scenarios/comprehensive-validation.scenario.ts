import { FormConfig } from '@ng-forge/dynamic-forms';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';
import { z } from 'zod';
import { TestScenario } from '../../shared/types';

/**
 * Comprehensive Zod schema with nested objects and arrays.
 * Tests complex validation scenarios including:
 * - Nested object validation (user.email, user.firstName)
 * - Array item validation (addresses[0].zip)
 * - Cross-field validation with refine
 */
const comprehensiveSchema = z
  .object({
    user: z.object({
      email: z.string().min(1, 'Email is required').email('Invalid email format'),
      firstName: z.string().min(2, 'First name must be at least 2 characters'),
      lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    }),
    addresses: z
      .array(
        z.object({
          street: z.string().min(5, 'Street must be at least 5 characters'),
          city: z.string().min(2, 'City must be at least 2 characters'),
          zip: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
        }),
      )
      .min(1, 'At least one address is required'),
  })
  .refine((data) => data.addresses.some((addr) => addr.city.toLowerCase() === data.user.lastName.toLowerCase()), {
    message: 'At least one address must be in your home city (matching your last name)',
    path: ['addresses'],
  });

/**
 * Form configuration for comprehensive validation testing.
 * Demonstrates groups, arrays, and Zod schema validation.
 */
const config = {
  schema: standardSchema(comprehensiveSchema),
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'user',
      type: 'group',
      fields: [
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          required: true,
          col: 12,
          value: '',
        },
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          required: true,
          col: 6,
          value: '',
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          required: true,
          col: 6,
          value: '',
        },
      ],
    },
    {
      key: 'addresses',
      type: 'array',
      fields: [
        [
          {
            key: 'addressRow',
            type: 'row',
            fields: [
              {
                key: 'street',
                type: 'input',
                label: 'Street',
                col: 6,
                value: '',
              },
              {
                key: 'city',
                type: 'input',
                label: 'City',
                col: 3,
                value: '',
              },
              {
                key: 'zip',
                type: 'input',
                label: 'ZIP',
                col: 3,
                value: '',
              },
            ],
          },
        ],
      ],
    },
    {
      key: 'addAddress',
      type: 'addArrayItem',
      arrayKey: 'addresses',
      label: 'Add Address',
      template: [
        {
          key: 'addressRow',
          type: 'row',
          fields: [
            {
              key: 'street',
              type: 'input',
              label: 'Street',
              col: 6,
            },
            {
              key: 'city',
              type: 'input',
              label: 'City',
              col: 3,
            },
            {
              key: 'zip',
              type: 'input',
              label: 'ZIP',
              col: 3,
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

export const comprehensiveValidationScenario: TestScenario = {
  testId: 'comprehensive-validation-test',
  title: 'Comprehensive Validation',
  description: 'Tests Zod schema validation with nested objects, arrays, and cross-field validation',
  config,
};
