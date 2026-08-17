/**
 * @ng-forge/dynamic-forms-cli
 *
 * Finds FormConfig objects in TypeScript/JavaScript sources and validates them
 * against the adapter schemas in `@ng-forge/dynamic-forms-zod`.
 *
 * Shipped as the `ng-forge-validate` command, and exported here so the MCP
 * server and other tooling reuse the same pipeline instead of duplicating it.
 *
 * The commander wiring deliberately lives outside this entry point, so
 * importing the library does not pull a CLI framework into the bundle.
 */

export { createSourceFile, findFormConfigCandidates, extractToJson, DATE_PLACEHOLDER, MAX_SOURCE_TEXT_LENGTH } from './ast-extractor.js';
export type { FormConfigCandidate, ExtractionResult, ExtractionWarning, ExtractionError } from './ast-extractor.js';

export { validateFile, validateSource, validateConfigObject, parseConfigInput, UI_INTEGRATIONS } from './validate-file.js';
export type { ConfigValidationResult, FileValidationResult, ParsedConfigInput } from './validate-file.js';

export { FIX_SUGGESTIONS, getFixSuggestion } from './fix-suggestions.js';

export { formatFileReport, formatConfigReport } from './report.js';
export type { ReportOptions } from './report.js';

export { collectRelatedDocs } from './related-docs.js';

export { runValidate, EXIT_OK, EXIT_INVALID_CONFIG, EXIT_USAGE } from './run-validate.js';
export type { ValidateOptions } from './run-validate.js';
