/**
 * @ng-forge/dynamic-forms-cli/validate
 *
 * Runtime FormConfig validation for configs that arrive as data: from an API,
 * a CMS, or an LLM. Safe to import from application code.
 *
 * This entry point deliberately imports from the validation library's
 * schema-only subpath rather than its root. The root also exports the ts-morph
 * source-discovery pipeline, which belongs in the `ng-forge-validate` command
 * and has no business in an application bundle.
 */

export {
  validateFormConfig,
  isValidFormConfig,
  getFormConfigJsonSchema,
  getAllFormConfigJsonSchemas,
  getFieldTypeJsonSchema,
  getLeafFieldJsonSchema,
  getAllLeafFieldJsonSchemas,
  getSupportedFieldTypes,
} from '@ng-forge/dynamic-forms-validation/schema-only';

export type {
  ValidationResult,
  FormattedValidationError,
  UiIntegration,
  FieldType,
  JsonSchemaType,
  JsonSchemaOptions,
} from '@ng-forge/dynamic-forms-validation/schema-only';
