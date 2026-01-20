import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import {
  FormStateCondition,
  isFormStateCondition,
  isStateLogicConfig,
  LogicConfig,
  StateLogicConfig,
} from '../../models/logic/logic-config';
import { CustomValidatorConfig, ValidatorConfig } from '../../models/validation/validator-config';
import { SchemaApplicationConfig } from '../../models/schemas/schema-definition';
import { CustomFunctionScope } from '../expressions/custom-function-types';

/**
 * Regular expression to detect formValue property access in expressions.
 * Matches patterns like: formValue.fieldName, formValue['fieldName'], formValue["fieldName"]
 */
const FORM_VALUE_ACCESS_PATTERN = /\bformValue\s*(?:\.|\[)/;

/**
 * Regular expressions to extract field paths from formValue expressions.
 *
 * Enhanced to capture full nested paths including dot notation chains:
 * - formValue.fieldName → captures 'fieldName'
 * - formValue.parent.child.grandchild → captures 'parent.child.grandchild'
 * - formValue['field-name'] → captures 'field-name'
 * - formValue["field.with.dots"] → captures 'field.with.dots'
 *
 * Note: Computed property access (formValue[variableName]) is NOT supported
 * and must use explicit dependsOn configuration.
 */
const FORM_VALUE_DOT_PATTERN = /\bformValue\.([\w.]+)/g;
const FORM_VALUE_BRACKET_SINGLE_PATTERN = /\bformValue\s*\[\s*'([\w.-]+)'\s*\]/g;
const FORM_VALUE_BRACKET_DOUBLE_PATTERN = /\bformValue\s*\[\s*"([\w.-]+)"\s*\]/g;

/**
 * Context for cross-field detection, providing access to function scope information.
 */
export interface CrossFieldDetectionContext {
  /**
   * Lookup function to get the scope of a registered custom function.
   *
   * @param functionName The name of the custom function
   * @returns The function's scope, or undefined if not registered
   */
  getFunctionScope?: (functionName: string) => CustomFunctionScope | undefined;
}

/**
 * Detects if a ConditionalExpression references other fields (cross-field).
 *
 * This is the core detection function that handles ALL expression types:
 * - `fieldValue` with `fieldPath` → Always cross-field
 * - `formValue` → Always cross-field
 * - `javascript` with `formValue.*` in expression → Cross-field
 * - `custom` → Checks registered function scope, defaults to cross-field if unknown
 * - `and`/`or` → Recursively check nested conditions
 *
 * @param expr The conditional expression to analyze
 * @param context Optional context providing function scope lookup
 * @returns true if the expression references other fields
 */
export function isCrossFieldExpression(
  expr: ConditionalExpression | boolean | FormStateCondition | undefined,
  context?: CrossFieldDetectionContext,
): boolean {
  // Boolean, undefined, or FormStateCondition (form-level state checks) are not cross-field
  if (expr === undefined || typeof expr === 'boolean' || isFormStateCondition(expr)) {
    return false;
  }

  switch (expr.type) {
    case 'fieldValue':
      // fieldPath means it references another field's value
      return !!expr.fieldPath;

    case 'formValue':
      // formValue type always accesses the form state
      return true;

    case 'javascript':
      // Check for formValue.* patterns in the expression string
      return FORM_VALUE_ACCESS_PATTERN.test(expr.expression || '');

    case 'custom': {
      // For custom functions, determine scope from registry or default to cross-field.
      // The expression.expression property holds the function name.
      //
      // Look up function scope from registry if context is provided
      const functionName = expr.expression;
      if (context?.getFunctionScope && functionName) {
        const scope = context.getFunctionScope(functionName);
        if (scope === 'field') {
          // Function is explicitly marked as field-scoped (no cross-field deps)
          return false;
        }
        // 'form' scope or undefined → treat as cross-field
      }

      // Default: conservative approach - assume cross-field
      return true;
    }

    case 'and':
    case 'or':
      // Recursively check nested conditions, passing context through
      return (expr.conditions || []).some((c) => isCrossFieldExpression(c, context));

    default:
      return false;
  }
}

/**
 * Extracts field dependencies from a ConditionalExpression.
 *
 * Returns an array of field keys that the expression depends on.
 * For `formValue` type without specific field, returns ['*'] to indicate
 * dependency on the entire form.
 *
 * @param expr The conditional expression to analyze
 * @returns Array of field keys that this expression depends on
 */
export function extractExpressionDependencies(expr: ConditionalExpression | boolean | undefined): string[] {
  if (expr === undefined || typeof expr === 'boolean') {
    return [];
  }

  const deps = new Set<string>();

  switch (expr.type) {
    case 'fieldValue':
      if (expr.fieldPath) {
        // Extract root field name (before any dots for nested paths)
        deps.add(expr.fieldPath.split('.')[0]);
      }
      break;

    case 'formValue':
      // Full form access - depends on everything
      deps.add('*');
      break;

    case 'javascript':
      // Extract from formValue.* patterns in expression
      extractFromExpressionString(expr.expression || '', deps);
      break;

    case 'custom':
      // Custom functions have full form access - conservative approach
      deps.add('*');
      break;

    case 'and':
    case 'or':
      // Recursively extract from nested conditions
      for (const condition of expr.conditions || []) {
        extractExpressionDependencies(condition).forEach((d) => deps.add(d));
      }
      break;
  }

  return Array.from(deps);
}

/**
 * Extracts field names from a JavaScript expression string.
 * Handles both dot notation (formValue.field) and bracket notation (formValue['field']).
 */
export function extractStringDependencies(expression: string): string[] {
  const deps = new Set<string>();
  extractFromExpressionString(expression, deps);
  return Array.from(deps);
}

/**
 * Internal helper that populates a Set with dependencies from an expression string.
 *
 * Extracts both root fields and full nested paths for precise dependency tracking:
 * - 'formValue.parent.child' → adds 'parent' (root) and 'parent.child' (full path)
 * - 'formValue.simple' → adds 'simple'
 */
function extractFromExpressionString(expression: string, deps: Set<string>): void {
  // Extract from dot notation: formValue.fieldName or formValue.parent.child.grandchild
  const dotMatches = expression.matchAll(FORM_VALUE_DOT_PATTERN);
  for (const match of dotMatches) {
    const fullPath = match[1];
    // Always add the root field (first segment) as the primary dependency
    const rootField = fullPath.split('.')[0];
    deps.add(rootField);
    // Also add the full path for more precise dependency tracking if nested
    if (fullPath.includes('.')) {
      deps.add(fullPath);
    }
  }

  // Extract from bracket notation with single quotes: formValue['fieldName']
  const bracketSingleMatches = expression.matchAll(FORM_VALUE_BRACKET_SINGLE_PATTERN);
  for (const match of bracketSingleMatches) {
    const fullPath = match[1];
    const rootField = fullPath.split('.')[0];
    deps.add(rootField);
    if (fullPath.includes('.')) {
      deps.add(fullPath);
    }
  }

  // Extract from bracket notation with double quotes: formValue["fieldName"]
  const bracketDoubleMatches = expression.matchAll(FORM_VALUE_BRACKET_DOUBLE_PATTERN);
  for (const match of bracketDoubleMatches) {
    const fullPath = match[1];
    const rootField = fullPath.split('.')[0];
    deps.add(rootField);
    if (fullPath.includes('.')) {
      deps.add(fullPath);
    }
  }
}

// ============================================================================
// Validator Detection
// ============================================================================

/**
 * Detects if a custom validator configuration references formValue (cross-field validation).
 *
 * @param config The custom validator configuration to check
 * @returns true if the validator references formValue
 */
export function isCrossFieldValidator(config: CustomValidatorConfig): boolean {
  if (!config.expression) {
    return false;
  }
  return FORM_VALUE_ACCESS_PATTERN.test(config.expression);
}

/**
 * Detects if a built-in validator has a dynamic expression that references formValue.
 *
 * Built-in validators (min, max, pattern, etc.) can have dynamic expressions
 * like `{ type: 'min', expression: 'formValue.minAge' }`.
 *
 * @param config The validator configuration to check
 * @returns true if the validator has a cross-field dynamic expression
 */
export function isCrossFieldBuiltInValidator(config: ValidatorConfig): boolean {
  if (config.type === 'custom') {
    return false; // Custom validators handled separately
  }

  // Check if expression property references formValue
  if ('expression' in config && typeof config.expression === 'string') {
    return FORM_VALUE_ACCESS_PATTERN.test(config.expression);
  }

  return false;
}

/**
 * Detects if a validator's `when` condition is cross-field.
 *
 * @param config The validator configuration to check
 * @param context Optional context providing function scope lookup
 * @returns true if the when condition references other fields
 */
export function hasCrossFieldWhenCondition(config: ValidatorConfig, context?: CrossFieldDetectionContext): boolean {
  if (!('when' in config) || !config.when) {
    return false;
  }
  return isCrossFieldExpression(config.when as ConditionalExpression, context);
}

// ============================================================================
// Logic Detection
// ============================================================================

/**
 * Detects if a StateLogicConfig has a cross-field condition.
 *
 * Note: This function only handles state logic (hidden, readonly, disabled, required).
 * Derivation logic is handled separately by the derivation system.
 *
 * @param config The state logic configuration to check
 * @param context Optional context providing function scope lookup
 * @returns true if the logic condition references other fields
 */
export function isCrossFieldStateLogic(config: StateLogicConfig, context?: CrossFieldDetectionContext): boolean {
  return isCrossFieldExpression(config.condition, context);
}

/**
 * Detects if a LogicConfig has a cross-field condition.
 *
 * @param config The logic configuration to check
 * @param context Optional context providing function scope lookup
 * @returns true if the logic condition references other fields
 *
 * @deprecated Use `isCrossFieldStateLogic` for state logic configs.
 *             Derivation logic is handled by the derivation system.
 */
export function isCrossFieldLogic(config: LogicConfig, context?: CrossFieldDetectionContext): boolean {
  // Only check state logic configs
  if (!isStateLogicConfig(config)) {
    return false;
  }
  return isCrossFieldExpression(config.condition, context);
}

// ============================================================================
// Schema Detection
// ============================================================================

/**
 * Detects if a SchemaApplicationConfig has a cross-field condition.
 *
 * @param config The schema application configuration to check
 * @param context Optional context providing function scope lookup
 * @returns true if the schema condition references other fields
 */
export function isCrossFieldSchema(config: SchemaApplicationConfig, context?: CrossFieldDetectionContext): boolean {
  if (config.type !== 'applyWhen' || !config.condition) {
    return false;
  }
  return isCrossFieldExpression(config.condition, context);
}
