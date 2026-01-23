import { FormConfig } from '@ng-forge/dynamic-forms';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';
import { z } from 'zod';
import { ExampleScenario } from '../shared/types';

/**
 * Zod schema for password confirmation validation.
 * Demonstrates multiple validation rules and cross-field validation with .refine().
 */
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Form configuration demonstrating Zod schema validation
 * for password confirmation.
 */
const config = {
  schema: standardSchema(passwordSchema),
  fields: [
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      // No `required: true` - Zod handles validation via .min(8) and .regex()
      props: {
        type: 'password',
        hint: 'Min 8 chars, uppercase, lowercase, and number required',
      },
      col: 12,
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      // No `required: true` - Zod handles validation via .min(1)
      props: {
        type: 'password',
        hint: 'Re-enter your password',
      },
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Register',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const zodSchemaValidationScenario: ExampleScenario = {
  id: 'zod-schema-validation',
  title: 'Zod Schema Validation',
  description: 'Demonstrates Zod schema validation for cross-field password confirmation',
  config,
};
