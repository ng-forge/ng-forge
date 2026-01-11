/**
 * Core module exports
 *
 * This module provides reusable validation logic that can be used
 * independently of the MCP transport layer.
 *
 * @example
 * ```typescript
 * // Direct import for use in other tools (e.g., AWS Amplify AI)
 * import { validateFormConfig } from '@ng-forge/dynamic-form-mcp';
 *
 * const result = validateFormConfig(config);
 * ```
 */

export type { FieldConfig, FormConfig, ValidationIssue, ValidationResult } from './types.js';

export { validateFormConfig, validateFormConfigIssues } from './validate-form-config.js';
