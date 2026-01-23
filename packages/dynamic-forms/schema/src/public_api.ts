/**
 * @ng-forge/dynamic-forms/schema
 *
 * Schema integration API for using Standard Schema compliant validation libraries
 * (Zod, Valibot, ArkType, etc.) with dynamic forms.
 *
 * This entrypoint provides:
 * - `standardSchema()` - Wrapper function to mark schemas for use with forms
 * - `isStandardSchemaMarker()` - Type guard for schema detection
 * - Type definitions for form schema configuration
 */

export { standardSchema, isStandardSchemaMarker } from './standard-schema-marker';
export type { StandardSchemaMarker, FormSchema, InferSchemaOutput, AngularSchemaCallback } from './standard-schema-marker';
