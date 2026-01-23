import type { FormConfig } from '../models/form-config';
import type { NarrowFields } from '../models/registry/field-registry';
import type { InferFormValue } from '../models/types/form-value-inference';
import type { FormSchema } from '@ng-forge/dynamic-forms/schema';

/**
 * Type-safe form config builder that ensures schema matches field structure.
 *
 * This helper function provides type safety when using form-level schemas by
 * automatically inferring the form value type from fields and constraining
 * the schema type parameter accordingly.
 *
 * **When to use:**
 * - When you have a form-level `schema` and want type safety between fields and schema
 * - When you prefer function syntax over `as const satisfies FormConfig`
 *
 * **Note:** This is optional. Users who don't need schema type safety can
 * continue using `as const satisfies FormConfig` directly.
 *
 * @typeParam TFields - The field definitions array (narrowed via `as const`)
 * @typeParam TProps - Optional form-level default props type
 *
 * @param config - The form configuration object
 * @returns The same configuration with proper type inference
 *
 * @example Basic usage with Zod schema
 * ```typescript
 * import { z } from 'zod';
 * import { formConfig } from '@ng-forge/dynamic-forms';
 * import { standardSchema } from '@ng-forge/dynamic-forms/schema';
 *
 * const passwordSchema = z.object({
 *   password: z.string().min(8),
 *   confirmPassword: z.string(),
 * }).refine(
 *   (data) => data.password === data.confirmPassword,
 *   { message: 'Passwords must match', path: ['confirmPassword'] }
 * );
 *
 * const config = formConfig({
 *   schema: standardSchema(passwordSchema),
 *   fields: [
 *     { key: 'password', type: 'input', label: 'Password', required: true, props: { type: 'password' } },
 *     { key: 'confirmPassword', type: 'input', label: 'Confirm', required: true, props: { type: 'password' } },
 *     { key: 'submit', type: 'submit', label: 'Register' },
 *   ] as const,
 * });
 * ```
 *
 * @example Equivalent without helper
 * ```typescript
 * const config = {
 *   schema: standardSchema(passwordSchema),
 *   fields: [...],
 * } as const satisfies FormConfig;
 * ```
 */
export function formConfig<const TFields extends NarrowFields, TProps extends object = Record<string, unknown>>(
  config: Omit<FormConfig<TFields, InferFormValue<TFields>, TProps>, 'schema'> & {
    schema?: FormSchema<InferFormValue<TFields>>;
  },
): FormConfig<TFields, InferFormValue<TFields>, TProps> {
  return config as FormConfig<TFields, InferFormValue<TFields>, TProps>;
}
