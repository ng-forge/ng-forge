import { Signal, untracked } from '@angular/core';
import { EvaluationContext } from '@ng-forge/dynamic-forms/internal';
import { ConditionalExpression } from '@ng-forge/dynamic-forms/internal';

import { parseArrayPath, resolveArrayPath, isArrayPlaceholderPath } from '../../utils/path-utils/path-utils';
import { CustomFunction } from '@ng-forge/dynamic-forms/internal';
import { evaluateCondition } from '@ng-forge/dynamic-forms/internal';
import { getNestedValue } from '@ng-forge/dynamic-forms/internal';
import { Logger } from '@ng-forge/dynamic-forms/internal';
import type { WarningTracker } from '@ng-forge/dynamic-forms/internal';
import { computeValueFromEntry } from '../derivation/compute-derived-value';
import { getParentPathInScope, resolveArrayItemScope } from '../derivation/evaluation-scope';
import { isAsyncPropertyDerivationEntry, PropertyDerivationCollection, PropertyDerivationEntry } from './property-derivation-types';
import { PropertyOverrideStore } from './property-override-store';

/** Context required for applying property derivations. */
export interface PropertyDerivationApplicatorContext {
  /** The current form value (signal) */
  formValue: Signal<Record<string, unknown>>;

  /** The property override store to write to */
  store: PropertyOverrideStore;

  /** Registered derivation functions (used for property derivations with `functionName`) */
  derivationFunctions?: Record<string, CustomFunction>;

  /** Custom functions for expression evaluation */
  customFunctions?: Record<string, CustomFunction>;

  /** External data resolved from form config signals */
  externalData?: Record<string, unknown>;

  /** Logger for diagnostic output */
  logger: Logger;

  /** Warning tracker to prevent log spam */
  warningTracker?: WarningTracker;
}

/** Result of property derivation processing. */
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
 * @param collection - The collected property derivation entries
 * @param context - Context for applying property derivations
 * @param changedFields - Optional set of changed field keys for filtering
 * @returns Result of the processing
 */
export function applyPropertyDerivations(
  collection: PropertyDerivationCollection,
  context: PropertyDerivationApplicatorContext,
  changedFields?: Set<string>,
): PropertyDerivationProcessingResult {
  let appliedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const baseEntries = changedFields ? getEntriesForChangedFields(collection.entries, changedFields) : collection.entries;
  // Async entries (HTTP / asyncFn / asyncFunctionName) are processed by dedicated
  // stream subscriptions in the orchestrator, not by this synchronous applicator.
  const entriesToProcess = baseEntries.filter((entry) => !isAsyncPropertyDerivationEntry(entry));

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

  // Parent group value: the absolute path with the trailing field segment
  // dropped. `undefined` when the field is at form root.
  const parentPath = getParentPathInScope(entry.fieldKey);
  const groupValue = parentPath ? getNestedValue(formValue, parentPath) : undefined;

  return {
    fieldValue,
    formValue,
    fieldPath: entry.fieldKey,
    groupValue,
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
  const pathInfo = parseArrayPath(entry.fieldKey);
  const { relativePath, groupValue, fieldValue } = resolveArrayItemScope(pathInfo, arrayItem);

  return {
    fieldValue,
    formValue: arrayItem,
    fieldPath: relativePath ? `${arrayPath}.${itemIndex}.${relativePath}` : `${arrayPath}.${itemIndex}`,
    groupValue,
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
  return computeValueFromEntry(entry, evalContext, {
    derivationFunctions: applicatorContext.derivationFunctions,
    subject: `${entry.fieldKey}.${entry.targetProperty}`,
    functionKind: 'Property derivation function',
  });
}
