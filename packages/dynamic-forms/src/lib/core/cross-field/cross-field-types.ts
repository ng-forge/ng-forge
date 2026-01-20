import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { StateLogicConfig } from '../../models/logic/logic-config';
import { ValidatorConfig } from '../../models/validation/validator-config';
import { SchemaApplicationConfig } from '../../models/schemas/schema-definition';

/**
 * Categories of cross-field configurations that need to be hoisted to form level.
 */
export type CrossFieldCategory = 'validator' | 'logic' | 'schema';

/**
 * Base interface for all cross-field entries.
 * All configurations that reference other fields share these common properties.
 */
export interface BaseCrossFieldEntry {
  /** The key of the field where this configuration was originally defined */
  sourceFieldKey: string;

  /** Field keys that this configuration depends on (extracted from expressions) */
  dependsOn: string[];

  /** The category of this cross-field entry */
  category: CrossFieldCategory;
}

/**
 * Cross-field validator entry.
 * Represents a validator that references formValue.* and needs form-level execution.
 *
 * Supports two types of validators:
 * 1. Custom validators with cross-field expressions (e.g., `formValue.password === formValue.confirmPassword`)
 * 2. Built-in validators with cross-field `when` conditions (e.g., `required` when `country === 'USA'`)
 */
export interface CrossFieldValidatorEntry extends BaseCrossFieldEntry {
  category: 'validator';

  /**
   * The validator configuration.
   * For custom validators, this contains the expression.
   * For built-in validators, this contains the type, value, and when condition.
   */
  config: ValidatorConfig;

  /**
   * For built-in validators with dynamic expressions, this contains
   * the validator type (min, max, pattern, etc.)
   */
  validatorType?: ValidatorConfig['type'];
}

/**
 * Logic types that can be controlled via cross-field conditions.
 */
export type LogicType = 'hidden' | 'disabled' | 'readonly' | 'required';

/**
 * Cross-field logic entry.
 * Represents a state logic condition that references other fields and needs form-level evaluation.
 *
 * Note: Derivation logic is handled separately by the derivation system.
 */
export interface CrossFieldLogicEntry extends BaseCrossFieldEntry {
  category: 'logic';

  /** The type of logic being controlled (hidden, disabled, readonly, required) */
  logicType: LogicType;

  /** The original condition expression */
  condition: ConditionalExpression;

  /** The full StateLogicConfig for reference */
  config: StateLogicConfig;
}

/**
 * Cross-field schema entry.
 * Represents a schema application condition that references other fields.
 */
export interface CrossFieldSchemaEntry extends BaseCrossFieldEntry {
  category: 'schema';

  /** The original schema application configuration */
  config: SchemaApplicationConfig;

  /** The condition that determines when the schema applies */
  condition: ConditionalExpression;
}

/**
 * Union type of all cross-field entry types.
 */
export type CrossFieldEntry = CrossFieldValidatorEntry | CrossFieldLogicEntry | CrossFieldSchemaEntry;

/**
 * Result of cross-field validation execution.
 * Maps source field keys to their validation errors.
 */
export interface CrossFieldValidationResult {
  /** Map of field key to validation error kinds */
  errors: Map<string, Array<{ kind: string; [key: string]: unknown }>>;

  /** Whether any cross-field validator failed */
  hasErrors: boolean;
}

/**
 * Result of cross-field logic evaluation.
 * Maps source field keys to their logic states.
 */
export interface CrossFieldLogicResult {
  /** Map of "fieldKey:logicType" to boolean state */
  states: Map<string, boolean>;

  /** Whether any logic state changed from previous evaluation */
  hasChanges: boolean;
}

/**
 * Result of cross-field schema evaluation.
 * Maps source field keys to their active schemas.
 */
export interface CrossFieldSchemaResult {
  /** Map of field key to active schema names */
  activeSchemas: Map<string, string[]>;

  /** Whether any schema state changed from previous evaluation */
  hasChanges: boolean;
}

/**
 * Combined result from the cross-field orchestrator.
 *
 * Note: Validation is handled separately by Angular's validateTree API.
 * The orchestrator only returns logic and schema results.
 */
export interface CrossFieldOrchestratorResult {
  logic: CrossFieldLogicResult;
  schemas: CrossFieldSchemaResult;
}

/**
 * Creates a unique key for a logic entry (fieldKey + logicType).
 */
export function createLogicStateKey(fieldKey: string, logicType: LogicType): string {
  return `${fieldKey}:${logicType}`;
}

/**
 * Parses a logic state key back into field key and logic type.
 */
export function parseLogicStateKey(key: string): { fieldKey: string; logicType: LogicType } {
  const [fieldKey, logicType] = key.split(':');
  return { fieldKey, logicType: logicType as LogicType };
}
