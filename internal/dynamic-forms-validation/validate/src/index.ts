/**
 * @ng-forge/dynamic-forms-validation/schema-only
 *
 * Runtime validation and JSON Schema generation for FormConfig objects.
 *
 * Transport-agnostic: used by the MCP server, the `ng-forge validate` CLI,
 * and directly by applications validating server-driven form configs.
 *
 * @example
 * ```typescript
 * import { getFormConfigJsonSchema, validateFormConfig } from '@ng-forge/dynamic-forms-validation';
 *
 * // JSON Schema for the config shape, e.g. to constrain an LLM's output
 * const schema = getFormConfigJsonSchema('material');
 *
 * // Validate a form config
 * const result = validateFormConfig('material', formConfig);
 * if (!result.valid) {
 *   console.error(result.errorSummary);
 * }
 * ```
 */

export * from './json-schema/index';
export * from './tools/index';
