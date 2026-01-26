import { FormConfig } from '@ng-forge/dynamic-forms';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';
import { z } from 'zod';
import { TestScenario } from '../../shared/types';

/**
 * Zod schema for password confirmation validation.
 * Uses .refine() for cross-field validation.
 */
const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
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
      required: true,
      props: { type: 'password' },
      col: 12,
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      required: true,
      props: { type: 'password' },
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

export const passwordConfirmationScenario: TestScenario = {
  testId: 'password-confirmation-test',
  title: 'Password Confirmation',
  description: 'Tests Zod schema validation for password confirmation using .refine()',
  config,
};
