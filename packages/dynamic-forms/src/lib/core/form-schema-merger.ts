import { schema, Schema, validateStandardSchema } from '@angular/forms/signals';
import { isStandardSchemaMarker, type FormSchema } from '@ng-forge/dynamic-forms/schema';

/**
 * Applies a form-level Standard Schema validation to a schema path.
 *
 * This is a helper function used internally by `createSchemaFromFields`
 * to apply form-level validation after field-level validation.
 *
 * @typeParam TModel - The form value type
 * @param path - The schema path to validate
 * @param formLevelSchema - Form-level Standard Schema marker
 *
 * @internal
 */
export function applyFormLevelSchema<TModel>(path: unknown, formLevelSchema: FormSchema<TModel>): void {
  if (isStandardSchemaMarker(formLevelSchema)) {
    // Standard Schema (Zod, Valibot, ArkType, etc.)
    // Type assertion required due to Angular's complex type constraints on validateStandardSchema
    // The path is the root schema path which is always valid for form-level validation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateStandardSchema(path as any, formLevelSchema.schema);
  }
}

/**
 * Creates a schema from only form-level schema (when no field-level schema exists).
 *
 * Use this when the form has fields without validation rules but still
 * needs form-level validation via a Standard Schema.
 *
 * @typeParam TModel - The form value type
 * @param formLevelSchema - Form-level Standard Schema
 * @returns Schema that applies form-level validation
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { standardSchema } from '@ng-forge/dynamic-forms/schema';
 *
 * const FormSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * // Create schema from form-level schema only
 * const formSchema = createFormLevelSchema(standardSchema(FormSchema));
 * ```
 */
export function createFormLevelSchema<TModel>(formLevelSchema: FormSchema<TModel>): Schema<TModel> {
  return schema<TModel>((path) => {
    applyFormLevelSchema(path, formLevelSchema);
  });
}
