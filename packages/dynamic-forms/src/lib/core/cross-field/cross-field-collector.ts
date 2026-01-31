import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { isStateLogicConfig, LogicConfig, StateLogicConfig } from '../../models/logic/logic-config';
import { ValidatorConfig, CustomValidatorConfig, BuiltInValidatorConfig } from '../../models/validation/validator-config';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { SchemaApplicationConfig } from '../../models/schemas/schema-definition';
import { hasChildFields } from '../../models/types/type-guards';
import { normalizeFieldsArray } from '../../utils/object-utils';
import {
  isCrossFieldValidator,
  isCrossFieldBuiltInValidator,
  hasCrossFieldWhenCondition,
  isCrossFieldStateLogic,
  isCrossFieldSchema,
  extractExpressionDependencies,
  extractStringDependencies,
} from './cross-field-detector';
import { CrossFieldValidatorEntry, CrossFieldLogicEntry, CrossFieldSchemaEntry, LogicType } from './cross-field-types';

/** Collected cross-field entries from traversing field definitions. */
export interface CrossFieldCollection {
  validators: CrossFieldValidatorEntry[];
  logic: CrossFieldLogicEntry[];
  schemas: CrossFieldSchemaEntry[];
}

/** Creates an empty cross-field collection. */
export function createEmptyCollection(): CrossFieldCollection {
  return {
    validators: [],
    logic: [],
    schemas: [],
  };
}

/** Traverses field definitions and collects cross-field entries (validators, logic, schemas). */
export function collectCrossFieldEntries(fields: FieldDef<unknown>[]): CrossFieldCollection {
  const collection = createEmptyCollection();
  traverseFields(fields, collection);
  return collection;
}

function traverseFields(fields: FieldDef<unknown>[], collection: CrossFieldCollection): void {
  for (const field of fields) {
    collectFromField(field, collection);

    // Recursively process container fields (page, row, group, array)
    if (hasChildFields(field)) {
      traverseFields(normalizeFieldsArray(field.fields) as FieldDef<unknown>[], collection);
    }
  }
}

function collectFromField(field: FieldDef<unknown>, collection: CrossFieldCollection): void {
  const fieldKey = field.key;
  if (!fieldKey) return;

  const validationField = field as FieldDef<unknown> & FieldWithValidation;

  // Collect cross-field validators
  if (validationField.validators) {
    for (const config of validationField.validators) {
      const entry = tryCreateValidatorEntry(fieldKey, config);
      if (entry) {
        collection.validators.push(entry);
      }
    }
  }

  // Collect cross-field logic
  if (validationField.logic) {
    for (const config of validationField.logic) {
      const entry = tryCreateLogicEntry(fieldKey, config);
      if (entry) {
        collection.logic.push(entry);
      }
    }
  }

  // Collect cross-field schemas
  if (validationField.schemas) {
    for (const config of validationField.schemas) {
      const entry = tryCreateSchemaEntry(fieldKey, config);
      if (entry) {
        collection.schemas.push(entry);
      }
    }
  }
}

/** Returns a validator entry if cross-field, null otherwise. */
function tryCreateValidatorEntry(fieldKey: string, config: ValidatorConfig): CrossFieldValidatorEntry | null {
  // Check for custom validators with cross-field expressions
  if (config.type === 'custom') {
    const customConfig = config as CustomValidatorConfig;
    if (isCrossFieldValidator(customConfig)) {
      return {
        sourceFieldKey: fieldKey,
        config,
        dependsOn: extractStringDependencies(customConfig.expression || ''),
        category: 'validator',
      };
    }
  }

  // Check for built-in validators with cross-field dynamic expressions
  if (isCrossFieldBuiltInValidator(config)) {
    const builtInConfig = config as BuiltInValidatorConfig;
    return {
      sourceFieldKey: fieldKey,
      config: convertBuiltInToCustomValidator(builtInConfig),
      validatorType: config.type,
      dependsOn: extractStringDependencies(builtInConfig.expression || ''),
      category: 'validator',
    };
  }

  // Check for validators with cross-field when conditions
  if (hasCrossFieldWhenCondition(config)) {
    const whenCondition = config.when as ConditionalExpression;
    return {
      sourceFieldKey: fieldKey,
      config,
      validatorType: config.type,
      dependsOn: extractExpressionDependencies(whenCondition),
      category: 'validator',
    };
  }

  return null;
}

/**
 * Returns a logic entry if cross-field state logic, null otherwise.
 *
 * Note: Derivation logic is handled separately by the derivation system
 * and is not collected here.
 */
function tryCreateLogicEntry(fieldKey: string, config: LogicConfig): CrossFieldLogicEntry | null {
  // Only process state logic (hidden, readonly, disabled, required)
  // Derivation logic is handled by the derivation collector
  if (!isStateLogicConfig(config)) {
    return null;
  }

  if (!isCrossFieldStateLogic(config)) {
    return null;
  }

  const condition = config.condition as ConditionalExpression;
  return {
    sourceFieldKey: fieldKey,
    logicType: config.type as LogicType,
    condition,
    config: config as StateLogicConfig,
    dependsOn: extractExpressionDependencies(condition),
    category: 'logic',
  };
}

/** Returns a schema entry if cross-field, null otherwise. */
function tryCreateSchemaEntry(fieldKey: string, config: SchemaApplicationConfig): CrossFieldSchemaEntry | null {
  if (!isCrossFieldSchema(config)) {
    return null;
  }

  const condition = config.condition as ConditionalExpression;
  return {
    sourceFieldKey: fieldKey,
    config,
    condition,
    dependsOn: extractExpressionDependencies(condition),
    category: 'schema',
  };
}

/** Converts a built-in validator with cross-field expression to a custom validator. */
function convertBuiltInToCustomValidator(config: BuiltInValidatorConfig): CustomValidatorConfig {
  const expression = config.expression;
  if (!expression) {
    throw new Error(`Built-in validator ${config.type} missing required expression for cross-field conversion`);
  }
  let validationExpression: string;

  switch (config.type) {
    case 'min':
      validationExpression = `fieldValue == null || fieldValue >= (${expression})`;
      break;
    case 'max':
      validationExpression = `fieldValue == null || fieldValue <= (${expression})`;
      break;
    case 'minLength':
      validationExpression = `fieldValue == null || (typeof fieldValue !== 'string' && !Array.isArray(fieldValue)) || fieldValue.length >= (${expression})`;
      break;
    case 'maxLength':
      validationExpression = `fieldValue == null || (typeof fieldValue !== 'string' && !Array.isArray(fieldValue)) || fieldValue.length <= (${expression})`;
      break;
    case 'pattern':
      // Validate regex pattern before injection to prevent runtime errors
      try {
        new RegExp(expression);
      } catch {
        throw new Error(`Invalid regex pattern in cross-field validator: ${expression}`);
      }
      validationExpression = `fieldValue == null || new RegExp(${JSON.stringify(expression)}).test(fieldValue)`;
      break;
    default:
      throw new Error(`Cannot convert ${config.type} validator to custom validator`);
  }

  return {
    type: 'custom',
    expression: validationExpression,
    kind: config.type,
    when: config.when,
    errorParams: {
      [config.type]: expression,
    },
  };
}
