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
 * @typeParam T - The form value type
 */
export type AngularSchemaCallback<T = unknown> = (path: SchemaPath<T> & SchemaPathTree<T>) => void;

/**
 * Wrapper interface that marks a schema as implementing the Standard Schema spec.
 * This allows the dynamic forms system to identify and use standard-compliant schemas
 * for validation without coupling to any specific schema library.
 *
 * @typeParam T - The inferred type that the schema validates to (covariant)
 */
export interface StandardSchemaMarker<out T = unknown> {
  /**
   * Internal marker identifying this as a standard schema wrapper.
   *
   * @internal
   */
  readonly ɵkind: typeof STANDARD_SCHEMA_KIND;

  /** The underlying schema that implements the Standard Schema spec. */
  readonly schema: StandardSchemaV1<T>;
}

/**
 * Type alias for form schemas that can be used with dynamic forms.
 * Supports both Standard Schema compliant schemas (Zod, Valibot, ArkType)
 * and raw Angular schema callbacks.
 *
 * @typeParam T - The inferred type that the schema validates to
 */
export type FormSchema<T = unknown> = StandardSchemaMarker<T> | AngularSchemaCallback<T>;

/**
 * Wraps a Standard Schema compliant schema for use with dynamic forms.
 *
 * @typeParam T - The inferred type that the schema validates to
 * @param schema - A schema implementing the Standard Schema V1 spec
 * @returns A wrapped schema marker that can be passed to dynamic form configuration
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
 * @param value - The value to check
 * @returns True if the value is a StandardSchemaMarker, false otherwise
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
