import { FormConfig } from '@ng-forge/dynamic-forms';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';
import { z } from 'zod';

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

/** Source representation of the Zod schema for display in the config viewer. */
export const zodSchemaSource = `z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
)`;

export const zodSchemaValidationConfig = {
  schema: Object.assign(standardSchema(passwordSchema), { __source: zodSchemaSource }),
  fields: [
    {
      key: 'password',
      type: 'input',
      label: 'Password',
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
