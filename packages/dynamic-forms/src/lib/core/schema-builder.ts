import { inject } from '@angular/core';
import { Schema, schema, validateTree, FieldContext, ValidationError, FieldTree } from '@angular/forms/signals';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { mapFieldToForm } from './form-mapping';
import { FieldTypeDefinition, getFieldValueHandling } from '@ng-forge/dynamic-forms/internal';
import { getFieldDefaultValue } from '../utils/default-value/default-value';
import { CrossFieldValidatorEntry } from './cross-field/cross-field-types';
import { FunctionRegistryService } from '@ng-forge/dynamic-forms/internal';
import { ExpressionParser } from '@ng-forge/dynamic-forms/internal';
import { evaluateCondition } from '@ng-forge/dynamic-forms/internal';
import { CustomValidatorConfig } from '@ng-forge/dynamic-forms/internal';
import { hasChildFields } from '@ng-forge/dynamic-forms/internal';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import type { Logger } from '@ng-forge/dynamic-forms/internal';
import { EvaluationContext } from '@ng-forge/dynamic-forms/internal';
import { normalizeFieldsArray } from '@ng-forge/dynamic-forms/internal';
import { getNestedValue } from '@ng-forge/dynamic-forms/internal';
import { applyFormLevelSchema } from './form-schema-merger';
import type { FormSchema } from '@ng-forge/dynamic-forms/schema';
import { VALIDATION_EXECUTION_DEFAULTS } from '../providers/features/validation-execution/validation-execution.token';
import { FieldTreeMappingContext, resolveDescendantContext, resolveFieldOwnContext } from './field-tree-mapping-context';

/** Gets a FieldTree by key, supporting nested paths with dot notation. */
function getFieldTreeByKey<TModel>(ctx: FieldContext<TModel>, key: string): FieldTree<unknown> | undefined {
  // Simple case - no nesting
  if (!key.includes('.')) {
    return (ctx.fieldTree as Record<string, FieldTree<unknown>>)[key];
  }

  // Nested path - traverse through the structure
  const parts = key.split('.');
  let current: unknown = ctx.fieldTree;

  for (const part of parts) {
    // FieldTree is callable (function), so typeof returns 'function' not 'object'.
    // Accept both to correctly traverse group sub-fields.
    if (!current || (typeof current !== 'object' && typeof current !== 'function')) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current as FieldTree<unknown> | undefined;
}

/** Options for creating a schema from field definitions. */
export interface CreateSchemaOptions<TModel = unknown> {
  /** Optional array of collected cross-field validators. */
  crossFieldValidators?: CrossFieldValidatorEntry[];

  /** Optional form-level Standard Schema for additional validation. */
  formLevelSchema?: FormSchema<TModel>;

  /** Form-level `validateWhenHidden` setting (from `FormConfig.options.validateWhenHidden`). */
  validateWhenHidden?: boolean;
}

/**
 * Creates an Angular signal forms schema from field definitions
 * This is the single entry point at dynamic form level that replaces createSchemaFromFields
 * Uses the new modular signal forms adapter structure
 *
 * @param fields Field definitions to create schema from
 * @param registry Field type registry
 * @param optionsOrValidators Optional configuration object or array of cross-field validators (for backwards compatibility)
 */
export function createSchemaFromFields<TModel = unknown>(
  fields: FieldDef<unknown>[],
  registry: Map<string, FieldTypeDefinition>,
  optionsOrValidators?: CrossFieldValidatorEntry[] | CreateSchemaOptions<TModel>,
): Schema<TModel> {
  // Inject services for cross-field validation
  // These will be available because createSchemaFromFields is called within runInInjectionContext
  const functionRegistry = inject(FunctionRegistryService);
  const logger = inject(DynamicFormLogger);
  const validationExecutionDefaults = inject(VALIDATION_EXECUTION_DEFAULTS);

  // Normalize options - support both old array signature and new options object
  const options: CreateSchemaOptions<TModel> = Array.isArray(optionsOrValidators)
    ? { crossFieldValidators: optionsOrValidators }
    : (optionsOrValidators ?? {});

  const { crossFieldValidators, formLevelSchema } = options;
  const rootContext: FieldTreeMappingContext = {
    validateWhenHidden: options.validateWhenHidden ?? validationExecutionDefaults.validateWhenHidden,
    ancestorAlwaysHidden: false,
    ancestorHiddenLogics: [],
  };

  return schema<TModel>((path) => {
    for (const fieldDef of fields) {
      const valueHandling = getFieldValueHandling(fieldDef.type, registry);

      // Handle different value handling modes
      if (valueHandling === 'exclude') {
        // Skip fields that don't contribute to form values
        continue;
      }

      if (valueHandling === 'flatten' && hasChildFields(fieldDef)) {
        // A flatten container can still set its own cascading overrides that flow
        // down to its children — including its own hidden state which has no
        // schema path of its own.
        const flattenedOwn = resolveFieldOwnContext(fieldDef, rootContext);
        const flattenedContext = resolveDescendantContext(fieldDef, flattenedOwn);
        for (const childField of normalizeFieldsArray(fieldDef.fields)) {
          if (!childField.key) continue;

          const childPath = (path as Record<string, SchemaPath<unknown>>)[childField.key];
          if (childPath) {
            mapFieldToForm(childField, childPath, flattenedContext);
          }
        }
        continue;
      }

      // Regular field processing for 'include' fields
      const fieldPath = (path as Record<string, SchemaPath<unknown>>)[fieldDef.key];

      if (!fieldPath) {
        continue;
      }

      // Use the new modular form mapping function
      // This will progressively apply validators, logic, and schemas
      // Cross-field logic is handled automatically via RootFormRegistryService
      mapFieldToForm(fieldDef, fieldPath, rootContext);
    }

    // Apply cross-field validators using validateTree
    if (crossFieldValidators && crossFieldValidators.length > 0) {
      applyCrossFieldTreeValidator(path as SchemaPathTree<TModel>, crossFieldValidators, functionRegistry, logger);
    }

    // Apply form-level Standard Schema validation
    if (formLevelSchema) {
      applyFormLevelSchema(path as SchemaPathTree<TModel>, formLevelSchema);
    }
  });
}

/**
 * Applies cross-field validators using Angular's validateTree API.
 *
 * @param rootPath The root schema path tree
 * @param validators Array of collected cross-field validators
 * @param functionRegistry Registry containing custom functions for expression evaluation
 * @param logger Logger for error reporting
 */
function applyCrossFieldTreeValidator<TModel>(
  rootPath: SchemaPathTree<TModel>,
  validators: CrossFieldValidatorEntry[],
  functionRegistry: FunctionRegistryService,
  logger: Logger,
): void {
  // Get custom functions for expression evaluation
  const customFunctions = functionRegistry.getCustomFunctions();

  validateTree(rootPath as SchemaPath<TModel>, (ctx: FieldContext<TModel>) => {
    if (validators.length === 0) {
      return null; // ValidationSuccess - no errors
    }

    // Read form value reactively - don't wrap in untracked() so Angular can track dependencies
    const formValue = ctx.value() as Record<string, unknown>;
    const errors: ValidationError.WithOptionalField[] = [];

    for (const entry of validators) {
      const { sourceFieldKey, config } = entry;

      try {
        const error = evaluateCrossFieldValidator(entry, formValue, sourceFieldKey, ctx, customFunctions, logger);

        if (error) {
          errors.push(error);
        }
      } catch (err) {
        logger.error(`Error evaluating cross-field validator for ${sourceFieldKey}:`, err);

        // On error, add a validation error to indicate the failure
        const targetField = getFieldTreeByKey(ctx, sourceFieldKey);

        if (targetField) {
          const customConfig = config as CustomValidatorConfig;
          errors.push({
            kind: customConfig.kind || config.type || 'custom',
            fieldTree: targetField,
          });
        }
      }
    }

    return errors.length > 0 ? errors : null;
  });
}

/** Evaluates a single cross-field validator entry and returns an error if validation fails. */
function evaluateCrossFieldValidator<TModel>(
  entry: CrossFieldValidatorEntry,
  formValue: Record<string, unknown>,
  sourceFieldKey: string,
  ctx: FieldContext<TModel>,
  customFunctions: EvaluationContext['customFunctions'],
  logger: Logger,
): ValidationError.WithOptionalField | null {
  const { config } = entry;
  const fieldValue = getNestedValue(formValue, sourceFieldKey);

  // Create evaluation context for condition/expression evaluation
  const evaluationContext: EvaluationContext = {
    fieldValue,
    formValue,
    fieldPath: sourceFieldKey,
    customFunctions,
    logger,
  };

  // The collector only routes custom validators (raw or converted built-ins) to the tree.
  // Guard against hand-built entries passed directly to createSchemaFromFields.
  if (config.type !== 'custom') {
    logger.warn(`Unexpected non-custom validator in cross-field tree for "${sourceFieldKey}"; ignoring.`);
    return null;
  }
  return evaluateCustomCrossFieldValidator(config as CustomValidatorConfig, evaluationContext, sourceFieldKey, ctx);
}

/** Evaluates a custom cross-field validator with an expression. */
function evaluateCustomCrossFieldValidator<TModel>(
  config: CustomValidatorConfig,
  evaluationContext: EvaluationContext,
  sourceFieldKey: string,
  ctx: FieldContext<TModel>,
): ValidationError.WithOptionalField | null {
  if (!config.expression) {
    return null;
  }

  const { fieldValue, formValue, logger, customFunctions } = evaluationContext;

  // First, evaluate the when condition if present
  // If the condition is false, the validator doesn't apply (validation passes)
  if (config.when) {
    const conditionMet = evaluateCondition(config.when, {
      fieldValue,
      formValue,
      fieldPath: sourceFieldKey,
      customFunctions: customFunctions || {},
      logger,
    });

    if (!conditionMet) {
      return null; // Condition not met, skip validation
    }
  }

  // Evaluate expression using the secure AST parser
  const result = ExpressionParser.evaluate(config.expression, evaluationContext);

  // If expression returns truthy, validation passes (no error)
  if (result) {
    return null;
  }

  // Validation failed - create error targeting the source field
  const targetField = getFieldTreeByKey(ctx, sourceFieldKey);
  if (!targetField) {
    evaluationContext.logger.warn(`Cross-field validator references non-existent field "${sourceFieldKey}"`);
    return null;
  }

  const errorObj: Record<string, unknown> = {
    kind: config.kind || 'custom',
    fieldTree: targetField,
  };

  // Evaluate and include errorParams for message interpolation
  if (config.errorParams) {
    for (const [key, expression] of Object.entries(config.errorParams)) {
      try {
        errorObj[key] = ExpressionParser.evaluate(expression, evaluationContext);
      } catch (error) {
        evaluationContext.logger.warn(`Failed to evaluate error param expression "${key}": ${expression}`, error);
      }
    }
  }

  return errorObj as unknown as ValidationError.WithOptionalField;
}

/** Utility to convert field definitions to default values object */
export function fieldsToDefaultValues<TModel = unknown>(fields: FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>): TModel {
  const defaultValues: Record<string, unknown> = {};

  for (const field of fields) {
    if (!field.key) continue;

    // Skip flatten fields (row/page) at top level - they are presentational containers
    const valueHandling = getFieldValueHandling(field.type, registry);
    if (valueHandling === 'flatten') {
      continue;
    }

    const value = getFieldDefaultValue(field, registry);
    if (value !== undefined) {
      defaultValues[field.key] = value;
    }
  }

  return defaultValues as TModel;
}
