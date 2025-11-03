// New organized exports
export * from './validation';
export * from './logic';
export * from './expressions';
export * from './values';
export * from './registry';
export * from './page-orchestrator';

// Schema application (keeping original file location for now)
export { applySchema, createSchemaFunction } from './schema-application';

// Main entry point for form mapping (keeping original file location for now)
export { mapFieldToForm } from './form-mapping';

// Schema building - main entry point for dynamic form component (keeping original file location for now)
export { createSchemaFromFields, fieldsToDefaultValues } from './schema-builder';

// Re-export types from organized models
export type {
  ValidatorConfig,
  LogicConfig,
  SchemaApplicationConfig,
  SchemaDefinition,
  ConditionalExpression,
  EvaluationContext,
} from '../models';
