import { isWritableSignal, Signal, untracked } from '@angular/core';
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
  DerivationProcessingResult,
} from './derivation-types';
import { DerivationWarningTracker } from './derivation-warning-tracker';
import { MAX_DERIVATION_ITERATIONS } from './derivation-constants';
import { DerivationLogger } from './derivation-logger.service';

// Re-export for backwards compatibility
export type { DerivationProcessingResult } from './derivation-types';

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

  /**
   * External data resolved from form config signals.
   * Made available in evaluation context as `externalData`.
   */
  externalData?: Record<string, unknown>;

  /** Logger for diagnostic output */
  logger: Logger;

  /**
   * Instance-scoped warning tracker to prevent log spam.
   * If not provided, warnings will be logged every time.
   */
  warningTracker?: DerivationWarningTracker;

  /**
   * Derivation logger for debug output.
   * Created via `createDerivationLogger()` factory.
   */
  derivationLogger: DerivationLogger;

  /**
   * Maximum number of iterations for derivation chain processing.
   * Falls back to MAX_DERIVATION_ITERATIONS constant if not provided.
   */
  maxIterations?: number;
}

/**
 * Result of a single derivation application.
 *
 * @internal
 */
interface DerivationResult {
  /** Whether the derivation was applied */
  applied: boolean;

  /** The field key */
  fieldKey: string;

  /** The computed value */
  newValue?: unknown;

  /** Error message if application failed */
  error?: string;

  /** Warning message (e.g., missing target field) - not a failure, but noteworthy */
  warning?: string;
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
  const { derivationLogger } = context;
  const maxIterations = context.maxIterations ?? MAX_DERIVATION_ITERATIONS;
  let appliedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  let warnCount = 0;

  // Filter entries based on changed fields
  const entriesToProcess = changedFields ? getEntriesForChangedFields(collection.entries, changedFields) : collection.entries;

  // Log cycle start in verbose mode
  derivationLogger.cycleStart('onChange', entriesToProcess.length);

  // Process derivations iteratively until no more changes
  let hasChanges = true;

  while (hasChanges && chainContext.iteration < maxIterations) {
    chainContext.iteration++;
    hasChanges = false;

    // Log iteration in verbose mode
    derivationLogger.iteration(chainContext.iteration);

    for (const entry of entriesToProcess) {
      const result = tryApplyDerivation(entry, context, chainContext);

      if (result.applied) {
        appliedCount++;
        hasChanges = true;
      } else if (result.error) {
        errorCount++;
      } else if (result.warning) {
        warnCount++;
        skippedCount++;
      } else {
        skippedCount++;
      }
    }
  }

  // Build result
  const processingResult: DerivationProcessingResult = {
    appliedCount,
    skippedCount,
    errorCount,
    warnCount,
    iterations: chainContext.iteration,
    maxIterationsReached: chainContext.iteration >= maxIterations,
  };

  if (processingResult.maxIterationsReached) {
    derivationLogger.maxIterationsReached(processingResult, 'onChange');
  }

  // Log summary
  derivationLogger.summary(processingResult, 'onChange');

  return processingResult;
}

/**
 * Gets entries that should be processed based on changed fields.
 *
 * Filters entries by checking if any of their dependencies are in the changed fields set.
 * Also includes all wildcard (*) entries since they depend on any form change.
 *
 * Note: Performance is O(n) where n = total entries. For large forms with many
 * derivations, consider optimizing with indexed lookup maps.
 *
 * @internal
 */
function getEntriesForChangedFields(entries: DerivationEntry[], changedFields: Set<string>): DerivationEntry[] {
  return entries.filter((entry) => {
    // Wildcard entries are always included
    if (entry.dependsOn.includes('*')) {
      return true;
    }

    // Check if any dependency is in changed fields
    return entry.dependsOn.some((dep) => changedFields.has(dep));
  });
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
 * { key: 'phonePrefix', logic: [{ type: 'derivation', condition: { field: 'country', operator: '==', value: 'USA' }, value: '+1' }] }
 * // When country is NOT USA, clear phonePrefix
 * { key: 'phonePrefix', logic: [{ type: 'derivation', condition: { field: 'country', operator: '!=', value: 'USA' }, value: '' }] }
 * ```
 *
 * @internal
 */
function tryApplyDerivation(
  entry: DerivationEntry,
  context: DerivationApplicatorContext,
  chainContext: DerivationChainContext,
): DerivationResult {
  const { derivationLogger } = context;

  // Check if this is an array field derivation (has '$' placeholder)
  if (isArrayPlaceholderPath(entry.fieldKey)) {
    return tryApplyArrayDerivation(entry, context, chainContext);
  }

  const derivationKey = createDerivationKey(entry.fieldKey);

  // Check if already applied in this cycle
  if (chainContext.appliedDerivations.has(derivationKey)) {
    derivationLogger.evaluation({
      debugName: entry.debugName,
      fieldKey: entry.fieldKey,
      result: 'skipped',
      skipReason: 'already-applied',
    });
    return { applied: false, fieldKey: entry.fieldKey };
  }

  // Create evaluation context
  const formValue = untracked(() => context.formValue());
  const evalContext = createEvaluationContext(entry, formValue, context);

  // Evaluate condition
  if (!evaluateDerivationCondition(entry.condition, evalContext)) {
    derivationLogger.evaluation({
      debugName: entry.debugName,
      fieldKey: entry.fieldKey,
      result: 'skipped',
      skipReason: 'condition-false',
    });
    return { applied: false, fieldKey: entry.fieldKey };
  }

  // Compute derived value
  let newValue: unknown;
  try {
    newValue = computeDerivedValue(entry, evalContext, context);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.logger.error(formatDerivationError(entry, 'compute', errorMessage));
    derivationLogger.evaluation({
      debugName: entry.debugName,
      fieldKey: entry.fieldKey,
      result: 'error',
      error: errorMessage,
    });
    return {
      applied: false,
      fieldKey: entry.fieldKey,
      error: errorMessage,
    };
  }

  // Check if value actually changed using exact equality.
  // Note: This uses isEqual which performs deep comparison with exact IEEE 754
  // equality for numbers. Bidirectional derivations with floating-point math
  // may oscillate due to rounding errors. Use explicit rounding in expressions
  // or integer arithmetic to avoid this issue.
  const currentValue = getNestedValue(formValue, entry.fieldKey);
  if (isEqual(currentValue, newValue)) {
    derivationLogger.evaluation({
      debugName: entry.debugName,
      fieldKey: entry.fieldKey,
      result: 'skipped',
      skipReason: 'value-unchanged',
    });
    return { applied: false, fieldKey: entry.fieldKey };
  }

  // Apply the value
  try {
    const wasApplied = applyValueToForm(entry.fieldKey, newValue, context.rootForm, context.logger, context.warningTracker);

    if (wasApplied) {
      chainContext.appliedDerivations.add(derivationKey);
      derivationLogger.evaluation({
        debugName: entry.debugName,
        fieldKey: entry.fieldKey,
        result: 'applied',
        previousValue: currentValue,
        newValue,
      });
      return { applied: true, fieldKey: entry.fieldKey, newValue };
    } else {
      // Field not found - this is a warning, not an error
      // The warning was already logged by warnMissingField
      derivationLogger.evaluation({
        debugName: entry.debugName,
        fieldKey: entry.fieldKey,
        result: 'skipped',
        skipReason: 'target-not-found',
      });
      return {
        applied: false,
        fieldKey: entry.fieldKey,
        warning: `Field '${entry.fieldKey}' not found`,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.logger.error(formatDerivationError(entry, 'apply', errorMessage));
    derivationLogger.evaluation({
      debugName: entry.debugName,
      fieldKey: entry.fieldKey,
      result: 'error',
      error: errorMessage,
    });
    return {
      applied: false,
      fieldKey: entry.fieldKey,
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

  // Parse the field path using path utilities
  const pathInfo = parseArrayPath(entry.fieldKey);
  if (!pathInfo.isArrayPath) {
    return { applied: false, fieldKey: entry.fieldKey, error: 'Invalid array derivation path' };
  }

  const { arrayPath } = pathInfo;

  // Get the array from form values
  const arrayValue = getNestedValue(formValue, arrayPath);
  if (!Array.isArray(arrayValue)) {
    return { applied: false, fieldKey: entry.fieldKey };
  }

  let appliedAny = false;

  // Process each array item
  for (let i = 0; i < arrayValue.length; i++) {
    const resolvedPath = resolveArrayPath(entry.fieldKey, i);
    const derivationKey = createDerivationKey(resolvedPath);

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
    const currentValue = getNestedValue(formValue, resolvedPath);
    if (isEqual(currentValue, newValue)) {
      continue;
    }

    // Apply the value
    try {
      applyValueToForm(resolvedPath, newValue, context.rootForm, context.logger, context.warningTracker);
      chainContext.appliedDerivations.add(derivationKey);
      appliedAny = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      context.logger.error(formatDerivationError(entry, 'apply', `[index ${i}] ${errorMessage}`));
    }
  }

  return { applied: appliedAny, fieldKey: entry.fieldKey };
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
    externalData: context.externalData,
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
  throw new Error(`Derivation for ${entry.fieldKey} has no value source. ` + `Specify 'value', 'expression', or 'functionName'.`);
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
): boolean {
  // Handle simple top-level fields
  if (!targetPath.includes('.')) {
    return setFieldValue(rootForm, targetPath, value, logger, warningTracker);
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
      return false;
    }

    // Navigate to the next level using bracket notation
    const next = (current as Record<string, unknown>)[part];
    if (next === undefined || next === null) {
      warnMissingField(targetPath, logger, warningTracker);
      return false; // Path doesn't exist
    }
    current = next;
  }

  // Set the final value
  const finalPart = parts[parts.length - 1];
  return setFieldValue(current, finalPart, value, logger, warningTracker);
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

  return `${ERROR_PREFIX} Failed to ${phase} derivation (field: ${entry.fieldKey}, ${source}): ${message}`;
}

/**
 * Sets a field value using the Angular Signal Forms pattern.
 *
 * Accesses the child field via bracket notation, drills down to find
 * the WritableSignal, and uses isWritableSignal for type-safe signal detection.
 *
 * Angular Signal Forms structure:
 * - form[key] is a callable function (field accessor)
 * - form[key]() returns the field instance with { value: WritableSignal<T> }
 * - form[key]().value.set(newValue) sets the value
 *
 * @returns true if the value was successfully set, false if field not found
 *
 * @internal
 */
function setFieldValue(
  parent: unknown,
  fieldKey: string,
  value: unknown,
  logger?: Logger,
  warningTracker?: DerivationWarningTracker,
): boolean {
  // Access child field via bracket notation (same pattern as group-field/array-field)
  const fieldAccessor = (parent as Record<string, unknown>)[fieldKey];

  if (fieldAccessor === undefined || fieldAccessor === null) {
    warnMissingField(fieldKey, logger, warningTracker);
    return false;
  }

  // Angular Signal Forms: field accessor is a callable function
  if (typeof fieldAccessor !== 'function') {
    warnMissingField(fieldKey, logger, warningTracker);
    return false;
  }

  // Call the accessor to get the field instance
  const fieldInstance = fieldAccessor();

  if (!fieldInstance || typeof fieldInstance !== 'object' || !('value' in fieldInstance)) {
    warnMissingField(fieldKey, logger, warningTracker);
    return false;
  }

  // Get the value signal and verify it's a WritableSignal
  const valueSignal = fieldInstance.value;

  if (isWritableSignal(valueSignal)) {
    valueSignal.set(value);
    return true;
  } else {
    warnMissingField(fieldKey, logger, warningTracker);
    return false;
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
 * Filters entries by trigger type and applies them.
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
  // Filter entries by trigger type
  const filteredEntries = collection.entries.filter((entry) => {
    if (trigger === 'onChange') {
      return !entry.trigger || entry.trigger === 'onChange';
    }
    return entry.trigger === trigger;
  });

  // Create a minimal collection with filtered entries
  const filteredCollection: DerivationCollection = {
    entries: filteredEntries,
  };

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
