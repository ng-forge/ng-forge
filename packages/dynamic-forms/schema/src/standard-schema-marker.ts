import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Internal marker symbol to identify StandardSchemaMarker instances.
 * Uses ɵ prefix following Angular's convention for internal APIs.
 */
export const STANDARD_SCHEMA_KIND = 'standardSchema' as const;

/**
 * Angular schema callback function type.
 * This is the raw callback that Angular's schema() function accepts.
 *
 * Use this when you want to write Angular schema validation directly
 * without any wrapper. This is ideal for Angular-only projects that
 * want full access to Angular's form validation APIs.
 *
 * @typeParam T - The form value type
 *
 * @example
 * ```typescript
 * import { FormConfig } from '@ng-forge/dynamic-forms';
 * import { validateTree } from '@angular/forms/signals';
 *
 * const config = {
 *   // Raw callback - no wrapper needed!
 *   schema: (path) => {
 *     validateTree(path, (ctx) => {
 *       const { password, confirmPassword } = ctx.value();
 *       if (password !== confirmPassword) {
 *         return [{ kind: 'passwordMismatch', fieldTree: ctx.fieldTreeOf(path).confirmPassword }];
 *       }
 *       return null;
 *     });
 *   },
 *   fields: [
 *     { key: 'password', type: 'input', label: 'Password', required: true },
 *     { key: 'confirmPassword', type: 'input', label: 'Confirm', required: true,
 *       validationMessages: { passwordMismatch: 'Passwords must match' } },
 *   ],
 * } as const satisfies FormConfig;
 * ```
 */
export type AngularSchemaCallback<T = unknown> = (path: SchemaPath<T> & SchemaPathTree<T>) => void;

/**
 * Wrapper interface that marks a schema as implementing the Standard Schema spec.
 * This allows the dynamic forms system to identify and use standard-compliant schemas
 * for validation without coupling to any specific schema library.
 *
 * The `out` variance modifier makes this type covariant in T, meaning a
 * StandardSchemaMarker<SpecificType> is assignable to StandardSchemaMarker<BroaderType>.
 * This enables Zod/Valibot schemas to be used with FormConfig's inferred TValue.
 *
 * @typeParam T - The inferred type that the schema validates to (covariant)
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { standardSchema } from '@ng-forge/dynamic-forms/schema';
 *
 * const userSchema = z.object({
 *   name: z.string(),
 *   email: z.string().email(),
 * });
 *
 * // Wrap the Zod schema with standardSchema marker
 * const formSchema = standardSchema(userSchema);
 * ```
 */
export interface StandardSchemaMarker<out T = unknown> {
  /**
   * Internal marker identifying this as a standard schema wrapper.
   * @internal
   */
  readonly ɵkind: typeof STANDARD_SCHEMA_KIND;

  /**
   * The underlying schema that implements the Standard Schema spec.
   */
  readonly schema: StandardSchemaV1<T>;
}

/**
 * Type alias for form schemas that can be used with dynamic forms.
 * Supports both Standard Schema compliant schemas (Zod, Valibot, ArkType)
 * and raw Angular schema callbacks.
 *
 * The covariance from StandardSchemaMarker flows through, allowing
 * schemas with specific types to be assigned to broader form value types.
 *
 * @typeParam T - The inferred type that the schema validates to
 *
 * @example Standard Schema (Zod)
 * ```typescript
 * import { z } from 'zod';
 * import { standardSchema } from '@ng-forge/dynamic-forms/schema';
 *
 * const config = {
 *   schema: standardSchema(z.object({ ... })),
 *   fields: [...],
 * };
 * ```
 *
 * @example Angular Schema Callback
 * ```typescript
 * import { validateTree } from '@angular/forms/signals';
 *
 * const config = {
 *   schema: (path) => {
 *     validateTree(path, (ctx) => { ... });
 *   },
 *   fields: [...],
 * };
 * ```
 */
export type FormSchema<T = unknown> = StandardSchemaMarker<T> | AngularSchemaCallback<T>;

/**
 * Wraps a Standard Schema compliant schema for use with dynamic forms.
 *
 * This function creates a marker wrapper around schemas that implement the
 * Standard Schema spec (Zod, Valibot, ArkType, etc.), allowing the dynamic
 * forms system to identify and use them for validation.
 *
 * @typeParam T - The inferred type that the schema validates to
 * @param schema - A schema implementing the Standard Schema V1 spec
 * @returns A wrapped schema marker that can be passed to dynamic form configuration
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { standardSchema } from '@ng-forge/dynamic-forms/schema';
 *
 * const loginSchema = z.object({
 *   email: z.string().email('Invalid email format'),
 *   password: z.string().min(8, 'Password must be at least 8 characters'),
 * });
 *
 * // Wrap for use with dynamic forms
 * const formSchema = standardSchema(loginSchema);
 *
 * // Use in form configuration
 * const formConfig = {
 *   schema: formSchema,
 *   fields: [
 *     input({ key: 'email', label: 'Email' }),
 *     input({ key: 'password', label: 'Password', props: { type: 'password' } }),
 *   ],
 * };
 * ```
 */
export function standardSchema<T>(schema: StandardSchemaV1<T>): StandardSchemaMarker<T> {
  return {
    ɵkind: STANDARD_SCHEMA_KIND,
    schema,
  };
}

/**
 * Type guard to check if a value is a StandardSchemaMarker.
 *
 * This is useful when processing form configuration to determine if a schema
 * has been provided and should be used for validation.
 *
 * @param value - The value to check
 * @returns True if the value is a StandardSchemaMarker, false otherwise
 *
 * @example
 * ```typescript
 * import { isStandardSchemaMarker } from '@ng-forge/dynamic-forms/schema';
 *
 * function processFormConfig(config: FormConfig) {
 *   if (config.schema && isStandardSchemaMarker(config.schema)) {
 *     // Use the schema for validation
 *     const result = config.schema.schema['~standard'].validate(formValue);
 *   }
 * }
 * ```
 */
export function isStandardSchemaMarker(value: unknown): value is StandardSchemaMarker {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ɵkind' in value &&
    (value as StandardSchemaMarker).ɵkind === STANDARD_SCHEMA_KIND &&
    'schema' in value
  );
}

/**
 * Extracts the output type from a Standard Schema.
 * Works with Zod, Valibot, ArkType, and other Standard Schema compliant libraries.
 */
export type InferSchemaOutput<T> = T extends StandardSchemaV1<infer Output> ? Output : never;
