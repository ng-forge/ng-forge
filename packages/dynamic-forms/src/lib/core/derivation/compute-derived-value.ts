import { DynamicFormError } from '../../errors/dynamic-form-error';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { CustomFunction } from '../expressions/custom-function-types';
import { ExpressionParser } from '../expressions/parser/expression-parser';
import { BaseDerivationEntry } from './derivation-entry-base';

/**
 * Inputs accepted by {@link computeValueFromEntry}.
 *
 * @internal
 */
export interface ComputeValueOptions {
  /**
   * Registered derivation functions, used when the entry has `functionName`.
   */
  derivationFunctions?: Record<string, CustomFunction>;

  /**
   * Subject label used in the "no value source" error message — typically the
   * resolved field key (e.g. `'items.0.lineTotal'`) or `${fieldKey}.${targetProperty}`
   * for property derivations.
   */
  subject: string;

  /**
   * Optional descriptor (e.g., `'Property derivation function'`) used in the
   * "function not found" error. Defaults to `'Derivation function'`.
   */
  functionKind?: string;
}

/**
 * Single dispatch over `value` / `expression` / `functionName` shared by both
 * the value-derivation and property-derivation applicators.
 *
 * Throws {@link DynamicFormError} on missing function or missing value source
 * so both pipelines surface the library's standard error type.
 *
 * @internal
 */
export function computeValueFromEntry(
  entry: Pick<BaseDerivationEntry, 'value' | 'expression' | 'functionName' | 'fn'>,
  evalContext: EvaluationContext,
  options: ComputeValueOptions,
): unknown {
  if (entry.value !== undefined) {
    return entry.value;
  }

  if (entry.expression) {
    return ExpressionParser.evaluate(entry.expression, evalContext);
  }

  if (entry.fn || entry.functionName) {
    if (entry.fn && entry.functionName) {
      evalContext.logger.warn(
        `Both "fn" and "functionName" are set on derivation for '${options.subject}'. Inline "fn" takes precedence; "functionName" is ignored.`,
      );
    }
    const fn = entry.fn ?? (entry.functionName ? options.derivationFunctions?.[entry.functionName] : undefined);
    if (!fn) {
      const kind = options.functionKind ?? 'Derivation function';
      throw new DynamicFormError(`${kind} '${entry.functionName}' not found in customFnConfig.derivations`);
    }
    return fn(evalContext);
  }

  throw new DynamicFormError(
    `Derivation for ${options.subject} has no value source. Specify 'value', 'expression', 'functionName', or 'fn'.`,
  );
}
