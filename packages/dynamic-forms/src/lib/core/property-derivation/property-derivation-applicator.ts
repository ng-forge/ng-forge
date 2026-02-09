import { Signal, untracked } from '@angular/core';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';

import { DynamicFormError } from '../../errors/dynamic-form-error';
import { parseArrayPath, resolveArrayPath, isArrayPlaceholderPath } from '../../utils/path-utils/path-utils';
import { CustomFunction } from '../expressions/custom-function-types';
import { evaluateCondition } from '../expressions/condition-evaluator';
import { ExpressionParser } from '../expressions/parser/expression-parser';
import { getNestedValue } from '../expressions/value-utils';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DerivationWarningTracker } from '../derivation/derivation-warning-tracker';
import { PropertyDerivationCollection, PropertyDerivationEntry } from './property-derivation-types';
import { PropertyOverrideStore } from './property-override-store';

/**
 * Context required for applying property derivations.
 *
 * @public
 */
export interface PropertyDerivationApplicatorContext {
  /** The current form value (signal) */
  formValue: Signal<Record<string, unknown>>;

  /** The property override store to write to */
  store: PropertyOverrideStore;

  /** Registered custom property derivation functions */
  propertyDerivationFunctions?: Record<string, CustomFunction>;

  /** Custom functions for expression evaluation */
  customFunctions?: Record<string, CustomFunction>;

  /** External data resolved from form config signals */
  externalData?: Record<string, unknown>;

  /** Logger for diagnostic output */
  logger: Logger;

  /** Warning tracker to prevent log spam */
  warningTracker?: DerivationWarningTracker;
}

/**
 * Result of property derivation processing.
 *
 * @public
 */
export interface PropertyDerivationProcessingResult {
  /** Number of property derivations successfully applied */
  appliedCount: number;
  /** Number of property derivations skipped */
  skippedCount: number;
  /** Number of property derivations that failed */
  errorCount: number;
}

/** @internal */
const ERROR_PREFIX = '[PropertyDerivation]';

/**
 * Applies all property derivation entries from a collection.
 *
 * Single-pass processing — property derivations read formValue and write to the
 * property override store. No iterative refinement needed because property
 * derivations don't chain among themselves.
 *
 * @param collection - The collected property derivation entries
 * @param context - Context for applying property derivations
 * @param changedFields - Optional set of changed field keys for filtering
 * @returns Result of the processing
 *
 * @public
 */
export function applyPropertyDerivations(
  collection: PropertyDerivationCollection,
  context: PropertyDerivationApplicatorContext,
  changedFields?: Set<string>,
): PropertyDerivationProcessingResult {
  let appliedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const entriesToProcess = changedFields ? getEntriesForChangedFields(collection.entries, changedFields) : collection.entries;

  for (const entry of entriesToProcess) {
    try {
      const applied = tryApplyPropertyDerivation(entry, context);
      if (applied) {
        appliedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      errorCount++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      context.logger.error(
        `${ERROR_PREFIX} Failed to process property derivation (field: ${entry.fieldKey}, property: ${entry.targetProperty}): ${errorMessage}`,
      );
    }
  }

  return { appliedCount, skippedCount, errorCount };
}

/**
 * Applies property derivations filtered by trigger type.
 *
 * @param collection - The collected property derivation entries
 * @param trigger - The trigger type to filter by
 * @param context - Context for applying property derivations
 * @param changedFields - Optional set of changed field keys for filtering
 * @returns Result of the processing
 *
 * @public
 */
export function applyPropertyDerivationsForTrigger(
  collection: PropertyDerivationCollection,
  trigger: 'onChange' | 'debounced',
  context: PropertyDerivationApplicatorContext,
  changedFields?: Set<string>,
): PropertyDerivationProcessingResult {
  const filteredEntries = collection.entries.filter((entry) => {
    if (trigger === 'onChange') {
      return !entry.trigger || entry.trigger === 'onChange';
    }
    return entry.trigger === trigger;
  });

  const filteredCollection: PropertyDerivationCollection = { entries: filteredEntries };
  return applyPropertyDerivations(filteredCollection, context, changedFields);
}

/**
 * Filters entries based on changed fields.
 *
 * @internal
 */
function getEntriesForChangedFields(entries: PropertyDerivationEntry[], changedFields: Set<string>): PropertyDerivationEntry[] {
  return entries.filter((entry) => {
    if (entry.dependsOn.includes('*')) return true;
    return entry.dependsOn.some((dep) => changedFields.has(dep));
  });
}

/**
 * Attempts to apply a single property derivation entry.
 *
 * @returns true if the override was applied, false if skipped
 *
 * @internal
 */
function tryApplyPropertyDerivation(entry: PropertyDerivationEntry, context: PropertyDerivationApplicatorContext): boolean {
  // Handle array field derivations
  if (isArrayPlaceholderPath(entry.fieldKey)) {
    return tryApplyArrayPropertyDerivation(entry, context);
  }

  const formValue = untracked(() => context.formValue());
  const evalContext = createEvaluationContext(entry, formValue, context);

  // Evaluate condition
  if (!evaluatePropertyCondition(entry.condition, evalContext)) {
    return false;
  }

  // Compute the derived property value
  const newValue = computePropertyValue(entry, evalContext, context);

  // Write to the store
  context.store.setOverride(entry.fieldKey, entry.targetProperty, newValue);
  return true;
}

/**
 * Handles array field property derivations with '$' placeholder.
 *
 * @internal
 */
function tryApplyArrayPropertyDerivation(entry: PropertyDerivationEntry, context: PropertyDerivationApplicatorContext): boolean {
  const formValue = untracked(() => context.formValue());

  const pathInfo = parseArrayPath(entry.fieldKey);
  if (!pathInfo.isArrayPath) {
    return false;
  }

  const { arrayPath } = pathInfo;
  const arrayValue = getNestedValue(formValue, arrayPath);
  if (!Array.isArray(arrayValue)) {
    return false;
  }

  let appliedAny = false;

  for (let i = 0; i < arrayValue.length; i++) {
    const resolvedPath = resolveArrayPath(entry.fieldKey, i);
    const arrayItem = arrayValue[i] as Record<string, unknown>;
    const evalContext = createArrayItemEvaluationContext(entry, arrayItem, formValue, i, arrayPath, context);

    if (!evaluatePropertyCondition(entry.condition, evalContext)) {
      continue;
    }

    try {
      const newValue = computePropertyValue(entry, evalContext, context);
      context.store.setOverride(resolvedPath, entry.targetProperty, newValue);
      appliedAny = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      context.logger.error(
        `${ERROR_PREFIX} Failed to compute property derivation (field: ${entry.fieldKey}, property: ${entry.targetProperty}, index: ${i}): ${errorMessage}`,
      );
    }
  }

  return appliedAny;
}

/**
 * Creates an evaluation context for property derivation processing.
 *
 * @internal
 */
function createEvaluationContext(
  entry: PropertyDerivationEntry,
  formValue: Record<string, unknown>,
  context: PropertyDerivationApplicatorContext,
): EvaluationContext {
  const fieldValue = getNestedValue(formValue, entry.fieldKey);

  return {
    fieldValue,
    formValue,
    fieldPath: entry.fieldKey,
    customFunctions: context.customFunctions,
    externalData: context.externalData,
    logger: context.logger,
  };
}

/**
 * Creates an evaluation context scoped to a specific array item.
 *
 * @internal
 */
function createArrayItemEvaluationContext(
  entry: PropertyDerivationEntry,
  arrayItem: Record<string, unknown>,
  rootFormValue: Record<string, unknown>,
  itemIndex: number,
  arrayPath: string,
  context: PropertyDerivationApplicatorContext,
): EvaluationContext {
  return {
    fieldValue: arrayItem,
    formValue: arrayItem,
    fieldPath: `${arrayPath}.${itemIndex}`,
    customFunctions: context.customFunctions,
    externalData: context.externalData,
    logger: context.logger,
    rootFormValue,
    arrayIndex: itemIndex,
    arrayPath,
  };
}

/**
 * Evaluates the property derivation condition.
 *
 * @internal
 */
function evaluatePropertyCondition(condition: ConditionalExpression | boolean, context: EvaluationContext): boolean {
  if (typeof condition === 'boolean') {
    return condition;
  }
  return evaluateCondition(condition, context);
}

/**
 * Computes the derived property value based on the entry configuration.
 *
 * @internal
 */
function computePropertyValue(
  entry: PropertyDerivationEntry,
  evalContext: EvaluationContext,
  applicatorContext: PropertyDerivationApplicatorContext,
): unknown {
  // Static value
  if (entry.value !== undefined) {
    return entry.value;
  }

  // Expression
  if (entry.expression) {
    return ExpressionParser.evaluate(entry.expression, evalContext);
  }

  // Custom function
  if (entry.functionName) {
    const fn = applicatorContext.propertyDerivationFunctions?.[entry.functionName];
    if (!fn) {
      throw new DynamicFormError(`Property derivation function '${entry.functionName}' not found in customFnConfig.propertyDerivations`);
    }
    return fn(evalContext);
  }

  throw new DynamicFormError(
    `Property derivation for ${entry.fieldKey}.${entry.targetProperty} has no value source. ` +
      `Specify 'value', 'expression', or 'functionName'.`,
  );
}
