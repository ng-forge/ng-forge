/**
 * @ng-forge/dynamic-forms-cli
 *
 * Finds FormConfig objects in TypeScript/JavaScript sources and validates them
 * against the adapter schemas.
 *
 * Shipped as the `ng-forge-validate` command. The pipeline itself lives in the
 * internal validation library, which this package bundles and re-exports so
 * tooling can reuse it without a second dependency.
 *
 * The commander wiring deliberately stays out of this entry point, so importing
 * the library does not pull a CLI framework into the bundle. For runtime
 * validation in an application, import `@ng-forge/dynamic-forms-cli/validate`
 * instead, which excludes the ts-morph source discovery.
 */

export {
  createSourceFile,
  findFormConfigCandidates,
  extractToJson,
  DATE_PLACEHOLDER,
  MAX_SOURCE_TEXT_LENGTH,
  validateFile,
  validateSource,
  validateConfigObject,
  parseConfigInput,
  UI_INTEGRATIONS,
  FIX_SUGGESTIONS,
  getFixSuggestion,
  formatFileReport,
  formatConfigReport,
  validateFormConfig,
  isValidFormConfig,
} from '@ng-forge/dynamic-forms-validation';

export type {
  FormConfigCandidate,
  ExtractionResult,
  ExtractionWarning,
  ExtractionError,
  ConfigValidationResult,
  FileValidationResult,
  ParsedConfigInput,
  ReportOptions,
  ValidationResult,
  FormattedValidationError,
  UiIntegration,
} from '@ng-forge/dynamic-forms-validation';

export { collectRelatedDocs } from './related-docs.js';

export { runValidate, EXIT_OK, EXIT_INVALID_CONFIG, EXIT_USAGE } from './run-validate.js';
export type { ValidateOptions } from './run-validate.js';
