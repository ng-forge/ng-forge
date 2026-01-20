/**
 * @ng-forge/dynamic-forms-zod/mcp
 *
 * MCP (Model Context Protocol) tools for dynamic forms.
 * Provides JSON Schema generation and validation utilities for LLM integration.
 *
 * @example
 * ```typescript
 * import { getFormConfigJsonSchema, validateFormConfig } from '@ng-forge/dynamic-forms-zod/mcp';
 *
 * // Get JSON Schema for MCP tool definition
 * const schema = getFormConfigJsonSchema('material');
 *
 * // Validate a form config
 * const result = validateFormConfig('material', formConfig);
 * if (!result.valid) {
 *   console.error(result.errorSummary);
 * }
 * ```
 */

export const MCP_TOOLS_VERSION = '0.4.0';

export * from './json-schema';
export * from './tools';
