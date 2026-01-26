import { schema, Schema, SchemaPathTree, validateStandardSchema } from '@angular/forms/signals';
// Import from secondary entry point - this is correct for ng-packagr's entry point architecture
// (different from importing internal barrel files which should be avoided)
import { isStandardSchemaMarker, type FormSchema } from '@ng-forge/dynamic-forms/schema';

/**
 * Applies a form-level schema validation to a schema path.
 * Supports both Standard Schema (Zod, Valibot, ArkType) and raw Angular schema callbacks.
 *
 * This is a helper function used internally by `createSchemaFromFields`
 * to apply form-level validation after field-level validation.
 *
 * @typeParam TModel - The form value type
 * @param path - The schema path to validate (from Angular's schema callback)
 * @param formLevelSchema - Form-level schema (Standard Schema marker or Angular callback)
 *
 * @remarks
 * Type assertions are required due to Angular's complex generic constraints:
 * - `validateStandardSchema` uses `IgnoreUnknownProperties<TSchema>` to accommodate Zod's strict types
 * - `SchemaPathTree` includes `SchemaPath` via conditional types that TypeScript can't narrow
 * These assertions are safe because the path originates from Angular's schema() function.
 *
 * @internal
 */
export function applyFormLevelSchema<TModel>(path: SchemaPathTree<TModel>, formLevelSchema: FormSchema<TModel>): void {
  if (isStandardSchemaMarker(formLevelSchema)) {
    // Standard Schema (Zod, Valibot, ArkType, etc.)
    // Cast via Parameters: validateStandardSchema's IgnoreUnknownProperties<TSchema> creates type incompatibility
    // that TypeScript cannot resolve. The cast is safe as path comes from Angular's schema() callback.
    (validateStandardSchema as (...args: unknown[]) => void)(path, formLevelSchema.schema);
  } else if (typeof formLevelSchema === 'function') {
    // Angular schema callback - execute directly with the path
    // Cast via Function: AngularSchemaCallback expects intersection type SchemaPath & SchemaPathTree.
    // SchemaPathTree structurally includes SchemaPath, so this is safe at runtime.
    (formLevelSchema as (path: unknown) => void)(path);
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
