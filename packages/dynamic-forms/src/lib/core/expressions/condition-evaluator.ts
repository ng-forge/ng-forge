import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { compareValues, getNestedValue, hasNestedProperty } from './value-utils';
import { ExpressionParser } from './parser/expression-parser';

/**
 * Evaluate conditional expression
 * Uses secure AST-based parsing for JavaScript expressions
 */
export function evaluateCondition(expression: ConditionalExpression, context: EvaluationContext): boolean {
  switch (expression.type) {
    case 'fieldValue':
      return evaluateFieldValueCondition(expression, context);

    case 'formValue':
      return evaluateFormValueCondition(expression, context);

    case 'javascript':
      return evaluateJavaScriptExpression(expression, context);

    case 'custom':
      return evaluateCustomFunction(expression, context);

    case 'and':
      return evaluateAndCondition(expression, context);

    case 'or':
      return evaluateOrCondition(expression, context);

    default:
      return false;
  }
}

function evaluateFieldValueCondition(expression: ConditionalExpression, context: EvaluationContext): boolean {
  if (!expression.fieldPath || !expression.operator) {
    context.logger.debug('Invalid fieldValue condition config: missing fieldPath or operator', expression);
    return false;
  }

  // Try scoped formValue first (handles sibling field lookups within array items).
  // Fall back to rootFormValue for fields outside the current array scope.
  // Use hasNestedProperty to distinguish "field exists with value undefined"
  // from "field path doesn't exist" — prevents incorrect fallback when an
  // optional array item field is intentionally undefined.
  const fieldValue = hasNestedProperty(context.formValue, expression.fieldPath)
    ? getNestedValue(context.formValue, expression.fieldPath)
    : context.rootFormValue
      ? getNestedValue(context.rootFormValue, expression.fieldPath)
      : undefined;
  return compareValues(fieldValue, expression.value, expression.operator);
}

function evaluateFormValueCondition(expression: ConditionalExpression, context: EvaluationContext): boolean {
  if (!expression.operator) {
    context.logger.debug('Invalid formValue condition config: missing operator', expression);
    return false;
  }
  return compareValues(context.formValue, expression.value, expression.operator);
}

function evaluateJavaScriptExpression(expression: ConditionalExpression, context: EvaluationContext): boolean {
  if (!expression.expression) return false;

  try {
    // Use secure AST-based expression parser instead of new Function()
    const result = ExpressionParser.evaluate(expression.expression, context);
    return !!result;
  } catch (error) {
    context.logger.error('Error evaluating JavaScript expression:', expression.expression, error);
    return false;
  }
}

function evaluateCustomFunction(expression: ConditionalExpression, context: EvaluationContext): boolean {
  if (!expression.expression) return false;

  const customFn = context.customFunctions?.[expression.expression];
  if (!customFn) {
    context.logger.error('Custom function not found:', expression.expression);
    return false;
  }

  try {
    return !!customFn(context);
  } catch (error) {
    context.logger.error('Error executing custom function:', expression.expression, error);
    return false;
  }
}

function evaluateAndCondition(expression: ConditionalExpression, context: EvaluationContext): boolean {
  if (!expression.conditions || expression.conditions.length === 0) return false;

  // All conditions must be true for AND logic
  return expression.conditions.every((condition) => evaluateCondition(condition, context));
}

function evaluateOrCondition(expression: ConditionalExpression, context: EvaluationContext): boolean {
  if (!expression.conditions || expression.conditions.length === 0) return false;

  // At least one condition must be true for OR logic
  return expression.conditions.some((condition) => evaluateCondition(condition, context));
}
