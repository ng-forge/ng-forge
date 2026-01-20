// New organized exports
export { applyValidator, applyValidators } from './validation';
export { applyLogic, applyMultipleLogic } from './logic';
export { compareValues, createLogicFunction, evaluateCondition, getNestedValue } from './expressions';
export { createDynamicValueFunction, createTypePredicateFunction } from './values';
export { FieldContextRegistryService, FunctionRegistryService, RootFormRegistryService, SchemaRegistryService } from './registry';
export { PageOrchestratorComponent } from './page-orchestrator';
export type { NavigationResult, PageOrchestratorConfig, PageOrchestratorState, PageVisibilityContext } from './page-orchestrator';

// Schema application (keeping original file location for now)
export { applySchema, createSchemaFunction } from './schema-application';

// Main entry point for form mapping (keeping original file location for now)
export { mapFieldToForm } from './form-mapping';

// Schema building - main entry point for dynamic form component (keeping original file location for now)
export { createSchemaFromFields, fieldsToDefaultValues } from './schema-builder';
export type { CreateSchemaOptions } from './schema-builder';

// Schema utilities for form-level Standard Schema integration
export { applyFormLevelSchema, createFormLevelSchema } from './form-schema-merger';

// Re-export types from specific model files
export type { ValidatorConfig } from '../models/validation/validator-config';
export type { LogicConfig } from '../models/logic/logic-config';
export type { SchemaApplicationConfig, SchemaDefinition } from '../models/schemas/schema-definition';
export type { ConditionalExpression } from '../models/expressions/conditional-expression';
export type { EvaluationContext } from '../models/expressions/evaluation-context';
