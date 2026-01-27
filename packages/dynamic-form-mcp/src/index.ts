/**
 * @ng-forge/dynamic-form-mcp
 *
 * MCP server for ng-forge dynamic forms - AI-assisted form schema generation
 *
 * @packageDocumentation
 */

export { createServer, runStdioServer, SERVER_NAME, SERVER_VERSION } from './server.js';

// Re-export registry types and functions for programmatic use
export type { FieldTypeInfo, ValidatorInfo, UIAdapterInfo, UIAdapterFieldType, PropertyInfo } from './registry/index.js';

export {
  getFieldTypes,
  getFieldType,
  getFieldTypesByCategory,
  getValidators,
  getValidator,
  getValidatorsByCategory,
  getUIAdapters,
  getUIAdapter,
  getUIAdapterFieldType,
} from './registry/index.js';

// Re-export validation from Zod package for direct use (e.g., Amplify AI tools)
export type { ValidationResult, FormattedValidationError, UiIntegration } from '@ng-forge/dynamic-forms-zod/mcp';

export { validateFormConfig, isValidFormConfig } from '@ng-forge/dynamic-forms-zod/mcp';

// Re-export JSON schema utilities
export { getFormConfigJsonSchema, getLeafFieldJsonSchema } from '@ng-forge/dynamic-forms-zod/mcp';
