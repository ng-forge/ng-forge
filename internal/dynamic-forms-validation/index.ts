/**
 * @ng-forge/dynamic-forms-validation
 *
 * Everything the MCP server and the validation CLI share: the Zod schemas for
 * every adapter, the FormConfig validator built on them, ts-morph discovery of
 * configs inside source files, and the report formatting.
 *
 * Internal by design. The published surfaces are
 * `@ng-forge/dynamic-forms-cli` and `@ng-forge/dynamic-form-mcp`, both of
 * which bundle this library rather than depending on it at runtime.
 */

// Adapter-agnostic base schemas.
export * from './src/index.js';

// Validation and JSON Schema generation.
export * from './validate/src/index.js';

// FormConfig discovery inside TypeScript/JavaScript sources.
export * from './discovery/ast-extractor.js';
export * from './discovery/validate-file.js';

// Report formatting and the error-to-fix table.
export * from './reporting/fix-suggestions.js';
export * from './reporting/report.js';
