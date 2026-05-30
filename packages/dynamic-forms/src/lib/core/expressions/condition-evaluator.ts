import {
  AndCondition,
  ConditionalExpression,
  FieldValueCondition,
  JavascriptCondition,
  OrCondition,
} from '../../models/expressions/conditional-expression';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { compareValues, getNestedValue, hasNestedProperty } from './value-utils';
import { ExpressionParser } from './parser/expression-parser';

/**
 * A sync condition slot must return a value, not an async primitive. A Promise
 * or Observable is a truthy object, so `!!result` would silently resolve to
 * `true` regardless of the eventual value. Detect both so the caller can warn
 * and fall back to `false` instead. Use the `async`/`http` condition types for
 * asynchronous logic.
 */
function isThenableOrObservable(value: unknown): boolean {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as { then?: unknown; subscribe?: unknown };
  return typeof candidate.then === 'function' || typeof candidate.subscribe === 'function';
}

/**
 * Evaluate conditional expression
 * Uses secure AST-based parsing for JavaScript expressions
 */
export function evaluateCondition(expression: ConditionalExpression, context: EvaluationContext): boolean {
  switch (expression.type) {
    case 'fieldValue':
      return evaluateFieldValueCondition(expression, context);

    case 'javascript':
      return evaluateJavaScriptExpression(expression, context);

    case 'custom': {
      // Read both keys via cast — the XOR type narrows to `never` when both
      // would be truthy, but JSON-loaded configs can produce that state at
      // runtime. We accept it here, warn, and let inline win.
      const bothSet = expression as { fn?: unknown; functionName?: string };
      const inlineFn = bothSet.fn as ((ctx: EvaluationContext) => unknown) | undefined;
      const registeredName = bothSet.functionName;

      if (inlineFn && registeredName) {
        context.logger.warn(
          'Both "fn" and "functionName" are set on custom condition. Inline "fn" takes precedence; "functionName" is ignored.',
        );
      }

      const customFn = inlineFn ?? (registeredName ? context.customFunctions?.[registeredName] : undefined);
      if (!customFn) {
        context.logger.error('Custom function not found:', registeredName);
        return false;
      }

      try {
        const result = customFn(context);
        if (isThenableOrObservable(result)) {
          context.logger.warn(
            `Custom condition '${registeredName ?? '<inline>'}' returned a Promise or Observable. ` +
              `Synchronous conditions must return a value; use an 'async' or 'http' condition type for asynchronous logic. Treating as false.`,
          );
          return false;
        }
        return !!result;
      } catch (error) {
        context.logger.error('Error executing custom function:', registeredName ?? '<inline>', error);
        return false;
      }
    }

    case 'and':
      return evaluateAndCondition(expression, context);

    case 'or':
      return evaluateOrCondition(expression, context);

    case 'http':
      context.logger.warn(
        'HTTP conditions are resolved asynchronously via createHttpConditionLogicFunction(). ' +
          'When used inside and/or composites, the HTTP result is not available synchronously. Returning false.',
      );
      return false;

    case 'async':
      context.logger.warn(
        'Async Condition - resolved asynchronously via createAsyncConditionLogicFunction(). ' +
          'When used inside and/or composites, the async result is not available synchronously. Returning false.',
      );
      return false;

    default:
      return false;
  }
}

function evaluateFieldValueCondition(expression: FieldValueCondition, context: EvaluationContext): boolean {
  // Guard against missing fieldPath — invalid config, return false
  if (!expression.fieldPath) return false;

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

function evaluateJavaScriptExpression(expression: JavascriptCondition, context: EvaluationContext): boolean {
  try {
    // Use secure AST-based expression parser instead of dynamic code execution
    const result = ExpressionParser.evaluate(expression.expression, context);
    return !!result;
  } catch (error) {
    context.logger.error('Error evaluating JavaScript expression:', expression.expression, error);
    return false;
  }
}

function evaluateAndCondition(expression: AndCondition, context: EvaluationContext): boolean {
  if (expression.conditions.length === 0) return false;
  // All conditions must be true for AND logic
  return expression.conditions.every((condition) => evaluateCondition(condition, context));
}

function evaluateOrCondition(expression: OrCondition, context: EvaluationContext): boolean {
  if (expression.conditions.length === 0) return false;
  // At least one condition must be true for OR logic
  return expression.conditions.some((condition) => evaluateCondition(condition, context));
}
