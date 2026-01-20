import { isSignal, Signal, untracked, WritableSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { isEqual } from '../../utils/object-utils';
import { parseArrayPath, resolveArrayPath, isArrayPlaceholderPath } from '../../utils/path-utils/path-utils';
import { CustomFunction } from '../expressions/custom-function-types';
import { evaluateCondition } from '../expressions/condition-evaluator';
import { ExpressionParser } from '../expressions/parser/expression-parser';
import { getNestedValue } from '../expressions/value-utils';
import { Logger } from '../../providers/features/logger/logger.interface';
import {
  createDerivationChainContext,
  createDerivationKey,
  DerivationChainContext,
  DerivationCollection,
  DerivationEntry,
} from './derivation-types';
import { DerivationWarningTracker } from './derivation-warning-tracker';
import { MAX_DERIVATION_ITERATIONS } from './derivation-constants';

/**
 * Context required for applying derivations.
 *
 * @public
 */
export interface DerivationApplicatorContext {
  /** The current form value (signal) */
  formValue: Signal<Record<string, unknown>>;

  /** Root form field tree for value updates */
  rootForm: FieldTree<unknown>;

  /** Registered custom derivation functions */
  derivationFunctions?: Record<string, CustomFunction>;

  /** Custom functions for expression evaluation */
  customFunctions?: Record<string, CustomFunction>;

  /** Logger for diagnostic output */
  logger: Logger;

  /**
   * Instance-scoped warning tracker to prevent log spam.
   * If not provided, warnings will be logged every time.
   */
  warningTracker?: DerivationWarningTracker;
}

/**
 * Result of a single derivation application.
 *
 * @internal
 */
interface DerivationResult {
  /** Whether the derivation was applied */
  applied: boolean;

  /** The target field key */
  targetFieldKey: string;

  /** The computed value */
  newValue?: unknown;

  /** Error message if application failed */
  error?: string;
}

/**
 * Result of processing all pending derivations.
 *
 * @public
 */
export interface DerivationProcessingResult {
  /** Number of derivations successfully applied */
  appliedCount: number;

  /** Number of derivations skipped (condition not met or value unchanged) */
  skippedCount: number;

  /** Number of derivations that failed */
  errorCount: number;

  /** Total iterations performed */
  iterations: number;

  /** Whether max iterations was reached (potential loop) */
  maxIterationsReached: boolean;
}

/**
 * Applies all pending derivations from a collection.
 *
 * This function processes derivations in order, evaluating conditions
 * and computing values. It handles loop prevention through:
 * 1. Chain tracking (prevents same derivation from running twice in one cycle)
 * 2. Value equality checks (skips if target already has computed value)
 * 3. Max iteration limit (safety fallback)
 *
 * @param collection - The collected derivation entries
 * @param context - Context for applying derivations
 * @param changedFields - Set of field keys that changed (for filtering)
 * @returns Result of the derivation processing
 *
 * @example
 * ```typescript
 * const result = applyDerivations(collection, {
 *   formValue: formValueSignal,
 *   rootForm: form(),
 *   derivationFunctions: customFnConfig?.derivations,
 *   logger: inject(DynamicFormLogger),
 * });
 *
 * if (result.maxIterationsReached) {
 *   console.warn('Possible derivation loop detected');
 * }
 * ```
 *
 * @public
 */
export function applyDerivations(
  collection: DerivationCollection,
  context: DerivationApplicatorContext,
  changedFields?: Set<string>,
): DerivationProcessingResult {
  const chainContext = createDerivationChainContext();
  let appliedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // Filter entries based on changed fields using O(k) lookup via bySource map
  // where k = number of changed fields (much faster than O(n*m) filter)
  const entriesToProcess = changedFields ? getEntriesForChangedFields(collection, changedFields) : collection.entries;

  // Process derivations iteratively until no more changes
  let hasChanges = true;

  while (hasChanges && chainContext.iteration < MAX_DERIVATION_ITERATIONS) {
    chainContext.iteration++;
    hasChanges = false;

    for (const entry of entriesToProcess) {
      const result = tryApplyDerivation(entry, context, chainContext);

      if (result.applied) {
        appliedCount++;
        hasChanges = true;
      } else if (result.error) {
        errorCount++;
      } else {
        skippedCount++;
      }
    }
  }

  const maxIterationsReached = chainContext.iteration >= MAX_DERIVATION_ITERATIONS;

  if (maxIterationsReached) {
    context.logger.error(
      `[Derivation] Processing reached max iterations (${MAX_DERIVATION_ITERATIONS}). ` +
        `This may indicate a loop in derivation logic that wasn't caught at build time. ` +
        `Consider restructuring derivations to reduce chain depth or using explicit 'dependsOn'.`,
    );
  }

  return {
    appliedCount,
    skippedCount,
    errorCount,
    iterations: chainContext.iteration,
    maxIterationsReached,
  };
}

/**
 * Gets entries that should be processed based on changed fields.
 *
 * Uses O(k) lookup via indexed maps instead of O(n*m) filter,
 * where k = number of changed fields, n = total entries, m = avg deps per entry.
 *
 * @internal
 */
function getEntriesForChangedFields(collection: DerivationCollection, changedFields: Set<string>): DerivationEntry[] {
  const entrySet = new Set<DerivationEntry>();

  // Add entries triggered by each changed field via byDependency map
  for (const fieldKey of changedFields) {
    const entries = collection.byDependency.get(fieldKey);
    if (entries) {
      for (const entry of entries) {
        entrySet.add(entry);
      }
    }

    // Check if this changed field is an array path - O(1) lookup
    const arrayEntries = collection.byArrayPath.get(fieldKey);
    if (arrayEntries) {
      for (const entry of arrayEntries) {
        entrySet.add(entry);
      }
    }
  }

  // Add all wildcard entries - O(w) where w = number of wildcard entries
  for (const entry of collection.wildcardEntries) {
    entrySet.add(entry);
  }

  return Array.from(entrySet);
}

/**
 * Attempts to apply a single derivation.
 *
 * **Important:** When a derivation's condition evaluates to `false`, the previously
 * derived value is NOT automatically cleared. If you need to reset a field when a
 * condition becomes false, use a separate derivation with an inverted condition
 * that sets the desired fallback value.
 *
 * @example
 * ```typescript
 * // Two derivations for conditional value with cleanup:
 * // When country is USA, set phonePrefix to '+1'
 * { condition: { field: 'country', operator: '==', value: 'USA' }, targetField: 'phonePrefix', value: '+1' }
 * // When country is NOT USA, clear phonePrefix
 * { condition: { field: 'country', operator: '!=', value: 'USA' }, targetField: 'phonePrefix', value: '' }
 * ```
 *
 * @internal
 */
function tryApplyDerivation(
  entry: DerivationEntry,
  context: DerivationApplicatorContext,
  chainContext: DerivationChainContext,
): DerivationResult {
  // Check if this is an array field derivation (has '$' placeholder)
  if (isArrayPlaceholderPath(entry.targetFieldKey)) {
    return tryApplyArrayDerivation(entry, context, chainContext);
  }

  const derivationKey = createDerivationKey(entry.sourceFieldKey, entry.targetFieldKey);

  // Check if already applied in this cycle
  if (chainContext.appliedDerivations.has(derivationKey)) {
    return { applied: false, targetFieldKey: entry.targetFieldKey };
  }

  // Create evaluation context
  const formValue = untracked(() => context.formValue());
  const evalContext = createEvaluationContext(entry, formValue, context);

  // Evaluate condition
  if (!evaluateDerivationCondition(entry.condition, evalContext)) {
    return { applied: false, targetFieldKey: entry.targetFieldKey };
  }

  // Compute derived value
  let newValue: unknown;
  try {
    newValue = computeDerivedValue(entry, evalContext, context);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.logger.error(formatDerivationError(entry, 'compute', errorMessage));
    return {
      applied: false,
      targetFieldKey: entry.targetFieldKey,
      error: errorMessage,
    };
  }

  // Check if value actually changed
  const currentValue = getNestedValue(formValue, entry.targetFieldKey);
  if (isEqual(currentValue, newValue)) {
    return { applied: false, targetFieldKey: entry.targetFieldKey };
  }

  // Apply the value
  try {
    applyValueToForm(entry.targetFieldKey, newValue, context.rootForm, context.logger, context.warningTracker);
    chainContext.appliedDerivations.add(derivationKey);
    return { applied: true, targetFieldKey: entry.targetFieldKey, newValue };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.logger.error(formatDerivationError(entry, 'apply', errorMessage));
    return {
      applied: false,
      targetFieldKey: entry.targetFieldKey,
      error: errorMessage,
    };
  }
}

/**
 * Handles array field derivations with '$' placeholder.
 *
 * Iterates over all array items and applies the derivation for each,
 * resolving '$' to the actual index and creating scoped evaluation contexts.
 *
 * @internal
 */
function tryApplyArrayDerivation(
  entry: DerivationEntry,
  context: DerivationApplicatorContext,
  chainContext: DerivationChainContext,
): DerivationResult {
  const formValue = untracked(() => context.formValue());

  // Parse the target path using path utilities
  const pathInfo = parseArrayPath(entry.targetFieldKey);
  if (!pathInfo.isArrayPath) {
    return { applied: false, targetFieldKey: entry.targetFieldKey, error: 'Invalid array derivation path' };
  }

  const { arrayPath } = pathInfo;

  // Get the array from form values
  const arrayValue = getNestedValue(formValue, arrayPath);
  if (!Array.isArray(arrayValue)) {
    return { applied: false, targetFieldKey: entry.targetFieldKey };
  }

  let appliedAny = false;

  // Process each array item
  for (let i = 0; i < arrayValue.length; i++) {
    const resolvedTargetPath = resolveArrayPath(entry.targetFieldKey, i);
    const derivationKey = createDerivationKey(entry.sourceFieldKey, resolvedTargetPath);

    // Skip if already applied in this cycle
    if (chainContext.appliedDerivations.has(derivationKey)) {
      continue;
    }

    // Create evaluation context scoped to this array item
    const arrayItem = arrayValue[i] as Record<string, unknown>;
    const evalContext = createArrayItemEvaluationContext(entry, arrayItem, formValue, i, arrayPath, context);

    // Evaluate condition
    if (!evaluateDerivationCondition(entry.condition, evalContext)) {
      continue;
    }

    // Compute derived value
    let newValue: unknown;
    try {
      newValue = computeDerivedValue(entry, evalContext, context);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      context.logger.error(formatDerivationError(entry, 'compute', `[index ${i}] ${errorMessage}`));
      continue;
    }

    // Check if value actually changed
    const currentValue = getNestedValue(formValue, resolvedTargetPath);
    if (isEqual(currentValue, newValue)) {
      continue;
    }

    // Apply the value
    try {
      applyValueToForm(resolvedTargetPath, newValue, context.rootForm, context.logger, context.warningTracker);
      chainContext.appliedDerivations.add(derivationKey);
      appliedAny = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      context.logger.error(formatDerivationError(entry, 'apply', `[index ${i}] ${errorMessage}`));
    }
  }

  return { applied: appliedAny, targetFieldKey: entry.targetFieldKey };
}

/**
 * Creates an evaluation context for derivation processing.
 *
 * @internal
 */
function createEvaluationContext(
  entry: DerivationEntry,
  formValue: Record<string, unknown>,
  context: DerivationApplicatorContext,
): EvaluationContext {
  const fieldValue = getNestedValue(formValue, entry.sourceFieldKey);

  return {
    fieldValue,
    formValue,
    fieldPath: entry.sourceFieldKey,
    customFunctions: context.customFunctions,
    logger: context.logger,
  };
}

/**
 * Creates an evaluation context scoped to a specific array item.
 *
 * For array derivations, `formValue` in the expression should reference
 * the current array item's values, not the root form values.
 *
 * @internal
 */
function createArrayItemEvaluationContext(
  entry: DerivationEntry,
  arrayItem: Record<string, unknown>,
  rootFormValue: Record<string, unknown>,
  itemIndex: number,
  arrayPath: string,
  context: DerivationApplicatorContext,
): EvaluationContext {
  // For array item expressions, formValue should be the array item
  // This allows expressions like 'formValue.quantity * formValue.unitPrice'
  // to work within the context of each array item
  return {
    fieldValue: arrayItem,
    formValue: arrayItem,
    fieldPath: `${arrayPath}.${itemIndex}`,
    customFunctions: context.customFunctions,
    logger: context.logger,
    // Provide access to root form value for cross-scope references
    rootFormValue,
    arrayIndex: itemIndex,
    arrayPath,
  };
}

/**
 * Evaluates the derivation condition.
 *
 * @internal
 */
function evaluateDerivationCondition(condition: ConditionalExpression | boolean, context: EvaluationContext): boolean {
  if (typeof condition === 'boolean') {
    return condition;
  }

  return evaluateCondition(condition, context);
}

/**
 * Computes the derived value based on the entry configuration.
 *
 * @internal
 */
function computeDerivedValue(
  entry: DerivationEntry,
  evalContext: EvaluationContext,
  applicatorContext: DerivationApplicatorContext,
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
    const fn = applicatorContext.derivationFunctions?.[entry.functionName];
    if (!fn) {
      throw new Error(`Derivation function '${entry.functionName}' not found in customFnConfig.derivations`);
    }
    return fn(evalContext);
  }

  // No value source specified
  throw new Error(`Derivation for ${entry.targetFieldKey} has no value source. ` + `Specify 'value', 'expression', or 'functionName'.`);
}

/**
 * Applies a value to the form at the specified path.
 *
 * Uses bracket notation to access child FieldTrees, following the same pattern
 * as group-field and array-field components. Fields are accessed as signals
 * and their value is set via the `.value.set()` method.
 *
 * Handles nested paths and array paths with '$' placeholder.
 *
 * @internal
 */
function applyValueToForm(
  targetPath: string,
  value: unknown,
  rootForm: FieldTree<unknown>,
  logger?: Logger,
  warningTracker?: DerivationWarningTracker,
): void {
  // Handle simple top-level fields
  if (!targetPath.includes('.')) {
    setFieldValue(rootForm, targetPath, value, logger, warningTracker);
    return;
  }

  // Handle nested paths (e.g., 'address.city' or 'items.$.quantity')
  const parts = targetPath.split('.');
  let current: unknown = rootForm;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    // Handle array index placeholder '$'
    if (part === '$') {
      // This case should be resolved at collection time
      // If we still have '$', we need to skip for now
      return;
    }

    // Navigate to the next level using bracket notation
    const next = (current as Record<string, unknown>)[part];
    if (next === undefined || next === null) {
      warnMissingField(targetPath, logger, warningTracker);
      return; // Path doesn't exist
    }
    current = next;
  }

  // Set the final value
  const finalPart = parts[parts.length - 1];
  setFieldValue(current, finalPart, value, logger, warningTracker);
}

/**
 * Error message prefix for derivation-related errors.
 * @internal
 */
const ERROR_PREFIX = '[Derivation]';

/**
 * Creates a standardized error message for derivation errors.
 * @internal
 */
function formatDerivationError(entry: DerivationEntry, phase: 'compute' | 'apply' | 'condition', message: string): string {
  const source = entry.expression
    ? `expression: "${entry.expression.substring(0, 50)}${entry.expression.length > 50 ? '...' : ''}"`
    : entry.functionName
      ? `function: "${entry.functionName}"`
      : entry.value !== undefined
        ? 'static value'
        : 'unknown source';

  return `${ERROR_PREFIX} Failed to ${phase} derivation (${entry.sourceFieldKey} → ${entry.targetFieldKey}, ${source}): ${message}`;
}

/**
 * Sets a field value using the Angular Signal Forms pattern.
 *
 * Accesses the child field via bracket notation, drills down to find
 * the WritableSignal, and uses isSignal for type-safe signal detection.
 *
 * Angular Signal Forms structure:
 * - form[key] is a callable function (field accessor)
 * - form[key]() returns the field instance with { value: WritableSignal<T> }
 * - form[key]().value.set(newValue) sets the value
 *
 * @internal
 */
function setFieldValue(
  parent: unknown,
  fieldKey: string,
  value: unknown,
  logger?: Logger,
  warningTracker?: DerivationWarningTracker,
): void {
  // Access child field via bracket notation (same pattern as group-field/array-field)
  const fieldAccessor = (parent as Record<string, unknown>)[fieldKey];

  if (fieldAccessor === undefined || fieldAccessor === null) {
    warnMissingField(fieldKey, logger, warningTracker);
    return;
  }

  // Angular Signal Forms: field accessor is a callable function
  if (typeof fieldAccessor !== 'function') {
    warnMissingField(fieldKey, logger, warningTracker);
    return;
  }

  // Call the accessor to get the field instance
  const fieldInstance = fieldAccessor();

  if (!fieldInstance || typeof fieldInstance !== 'object' || !('value' in fieldInstance)) {
    warnMissingField(fieldKey, logger, warningTracker);
    return;
  }

  // Get the value signal and verify it's a WritableSignal
  const valueSignal = fieldInstance.value;

  if (isSignal(valueSignal) && typeof (valueSignal as WritableSignal<unknown>).set === 'function') {
    (valueSignal as WritableSignal<unknown>).set(value);
  } else {
    warnMissingField(fieldKey, logger, warningTracker);
  }
}

/**
 * Logs a warning for a missing target field (once per field per form instance).
 *
 * Uses the provided warning tracker to avoid log spam. If no tracker is provided,
 * the warning will be logged every time.
 *
 * @internal
 */
function warnMissingField(fieldKey: string, logger?: Logger, warningTracker?: DerivationWarningTracker): void {
  // If tracker is provided, check if we've already warned about this field
  if (warningTracker) {
    if (warningTracker.warnedFields.has(fieldKey)) {
      return;
    }
    warningTracker.warnedFields.add(fieldKey);
  }

  logger?.warn(
    `${ERROR_PREFIX} Target field '${fieldKey}' not found in form. ` +
      `Ensure the field is defined in your form configuration. ` +
      `This warning is shown once per field.`,
  );
}

/**
 * Processes derivations for a specific trigger type.
 *
 * Use this to filter derivations by trigger (onChange vs debounced).
 * Uses pre-computed cached collections when available for better performance.
 *
 * @param collection - The collected derivation entries
 * @param trigger - The trigger type to filter by
 * @param context - Context for applying derivations
 * @param changedFields - Set of field keys that changed (for filtering)
 * @returns Result of the derivation processing
 *
 * @public
 */
export function applyDerivationsForTrigger(
  collection: DerivationCollection,
  trigger: 'onChange' | 'debounced',
  context: DerivationApplicatorContext,
  changedFields?: Set<string>,
): DerivationProcessingResult {
  // Use pre-computed cached collection if available (avoids runtime filtering/map rebuilding)
  if (trigger === 'onChange' && collection.onChangeCollection) {
    return applyDerivations(collection.onChangeCollection, context, changedFields);
  }

  // Fallback to runtime filtering for edge cases or when cache is not available
  const filteredCollection: DerivationCollection = {
    entries: collection.entries.filter((entry) => {
      if (trigger === 'onChange') {
        return !entry.trigger || entry.trigger === 'onChange';
      }
      return entry.trigger === trigger;
    }),
    byTarget: new Map(),
    bySource: new Map(),
    byDependency: new Map(),
    byArrayPath: new Map(),
    wildcardEntries: [],
  };

  // Rebuild lookup maps for filtered entries
  for (const entry of filteredCollection.entries) {
    const targetEntries = filteredCollection.byTarget.get(entry.targetFieldKey) ?? [];
    targetEntries.push(entry);
    filteredCollection.byTarget.set(entry.targetFieldKey, targetEntries);

    const sourceEntries = filteredCollection.bySource.get(entry.sourceFieldKey) ?? [];
    sourceEntries.push(entry);
    filteredCollection.bySource.set(entry.sourceFieldKey, sourceEntries);

    // Build byDependency map and track wildcards
    let hasWildcard = false;
    for (const dep of entry.dependsOn) {
      if (dep === '*') {
        hasWildcard = true;
      } else {
        const depEntries = filteredCollection.byDependency.get(dep) ?? [];
        depEntries.push(entry);
        filteredCollection.byDependency.set(dep, depEntries);
      }
    }

    if (hasWildcard) {
      filteredCollection.wildcardEntries.push(entry);
    }

    // Build byArrayPath map
    if (isArrayPlaceholderPath(entry.targetFieldKey)) {
      const arrayPath = parseArrayPath(entry.targetFieldKey).arrayPath;
      if (arrayPath) {
        const arrayEntries = filteredCollection.byArrayPath.get(arrayPath) ?? [];
        arrayEntries.push(entry);
        filteredCollection.byArrayPath.set(arrayPath, arrayEntries);
      }
    }
  }

  return applyDerivations(filteredCollection, context, changedFields);
}

/**
 * Gets all debounced derivation entries from a collection.
 *
 * Use this to extract debounced entries for separate processing with debounce timers.
 *
 * @param collection - The collected derivation entries
 * @returns Array of debounced derivation entries
 *
 * @public
 */
export function getDebouncedDerivationEntries(collection: DerivationCollection): DerivationEntry[] {
  return collection.entries.filter((entry) => entry.trigger === 'debounced');
}
