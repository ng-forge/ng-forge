import { ValidatorConfig } from '../validation/validator-config';
import { LogicConfig } from '../logic/logic-config';
import { ConditionalExpression } from '../expressions/conditional-expression';

/**
 * Configuration for applying predefined schemas
 */
export interface SchemaApplicationConfig {
  /** Schema application type */
  type: 'apply' | 'applyWhen' | 'applyWhenValue' | 'applyEach';

  /** Schema identifier or inline schema definition */
  schema: string | SchemaDefinition;

  /** Condition for conditional application */
  condition?: ConditionalExpression;

  /** Type predicate for applyWhenValue */
  typePredicate?: string;
}

/**
 * Reusable schema definition that can be referenced by name
 */
export interface SchemaDefinition {
  /** Unique schema identifier */
  name: string;

  /** Schema description */
  description?: string;

  /** Field path pattern this schema applies to */
  pathPattern?: string;

  /** Validators to apply */
  validators?: ValidatorConfig[];

  /** Logic rules to apply */
  logic?: LogicConfig[];

  /** Nested schema applications */
  subSchemas?: SchemaApplicationConfig[];
}
