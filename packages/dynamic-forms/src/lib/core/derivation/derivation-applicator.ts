import { isWritableSignal, Signal, untracked } from '@angular/core';
import type { FieldState, FieldTree } from '@angular/forms/signals';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import type { FieldStateInfo } from '../../models/expressions/field-state-context';
import type { FieldTreeRecord } from '../field-tree-utils';
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
import { readFieldStateInfo, createFormFieldStateMap } from './field-state-extractor';

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
  chainContext.changedFields = changedFields;
  // Cache formFieldState map per cycle to avoid allocating a new Proxy + Map per entry
  chainContext.formFieldState = createFormFieldStateMap(context.rootForm, false);
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
 * **Parent-key matching:** Since `changedFields` contains root-level keys (e.g., `'address'`),
 * but derivation entries may target or depend on nested paths (e.g., `'address.city'`),
 * this function checks `startsWith(changed + '.')` to include entries whose field or
 * dependencies live under a changed parent. This is intentionally broad — false positives
 * are acceptable for filtering because entries are still guarded by value-equality checks
 * (`isEqual`) in `tryApplyDerivation` and will be skipped if the value hasn't changed.
 *
 * Note: Performance is O(n) where n = total entries. For large forms with many
 * derivations, consider optimizing with indexed lookup maps.
 *
 * @internal
 */
function getEntriesForChangedFields(entries: DerivationEntry[], changedFields: Set<string>): DerivationEntry[] {
  return entries.filter((entry) => {
    // Entries with no dependencies or wildcard dependencies always run
    if (entry.dependsOn.length === 0 || entry.dependsOn.includes('*')) {
      return true;
    }

    // Check if any dependency matches a changed field directly
    if (entry.dependsOn.some((dep) => changedFields.has(dep))) {
      return true;
    }

    // For array entries (fieldKey contains '$'), check if the entry's parent
    // array key changed. Array derivations have relative dependencies
    // (e.g., 'quantity') but changedFields contains root keys (e.g., 'lineItems').
    for (const changed of changedFields) {
      // Check if this entry lives under a changed parent (array or nested)
      if (entry.fieldKey.startsWith(changed + '.')) return true;
      // Check if a dependency is nested under a changed parent
      if (entry.dependsOn.some((dep) => dep.startsWith(changed + '.'))) return true;
    }

    return false;
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

  // Check stopOnUserOverride — skip if the user has manually edited the target field
  if (shouldSkipForUserOverride(entry, entry.fieldKey, context, chainContext)) {
    derivationLogger.evaluation({
      debugName: entry.debugName,
      fieldKey: entry.fieldKey,
      result: 'skipped',
      skipReason: 'user-override',
    });
    return { applied: false, fieldKey: entry.fieldKey };
  }

  // Create evaluation context
  const formValue = untracked(() => context.formValue());
  const evalContext = createEvaluationContext(entry, formValue, context, chainContext);

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

    // Check stopOnUserOverride for array items using dirty() signal
    if (shouldSkipForUserOverride(entry, resolvedPath, context, chainContext)) {
      context.derivationLogger.evaluation({
        debugName: entry.debugName,
        fieldKey: resolvedPath,
        result: 'skipped',
        skipReason: 'user-override',
      });
      continue;
    }

    // Create evaluation context scoped to this array item
    const arrayItem = arrayValue[i] as Record<string, unknown>;
    const evalContext = createArrayItemEvaluationContext(entry, arrayItem, formValue, i, arrayPath, context, chainContext);

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
  chainContext: DerivationChainContext,
): EvaluationContext {
  const fieldValue = getNestedValue(formValue, entry.fieldKey);

  // Create field state snapshot for this specific field (non-reactive)
  const fieldAccessor = (context.rootForm as FieldTreeRecord)[entry.fieldKey];
  const fieldState = fieldAccessor ? readFieldStateInfo(fieldAccessor, false) : undefined;

  return {
    fieldValue,
    formValue,
    fieldPath: entry.fieldKey,
    customFunctions: context.customFunctions,
    externalData: context.externalData,
    logger: context.logger,
    fieldState,
    formFieldState: chainContext.formFieldState,
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
  chainContext: DerivationChainContext,
): EvaluationContext {
  // For array item expressions, formValue should be the array item
  // This allows expressions like 'formValue.quantity * formValue.unitPrice'
  // to work within the context of each array item

  // Create field state snapshot for the specific array item field
  // Navigate: rootForm[arrayPath][index][fieldKey]
  const pathInfo = parseArrayPath(entry.fieldKey);
  let fieldState: FieldStateInfo | undefined;

  if (pathInfo.isArrayPath && pathInfo.relativePath) {
    const rootFormRecord = context.rootForm as FieldTreeRecord;
    const arrayAccessor = rootFormRecord[arrayPath];
    if (arrayAccessor) {
      const arrayItems = arrayAccessor as FieldTreeRecord;
      const itemAccessor = arrayItems[String(itemIndex)];
      if (itemAccessor) {
        const itemFields = itemAccessor as FieldTreeRecord;
        const fieldAccessor = itemFields[pathInfo.relativePath];
        if (fieldAccessor) {
          fieldState = readFieldStateInfo(fieldAccessor, false);
        }
      }
    }
  }

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
    fieldState,
    formFieldState: chainContext.formFieldState,
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
    return setFieldValue(rootForm as FieldTreeRecord, targetPath, value, logger, warningTracker);
  }

  // Handle nested paths (e.g., 'address.city' or 'items.$.quantity')
  const parts = targetPath.split('.');
  let current = rootForm as FieldTreeRecord;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    // Handle array index placeholder '$'
    if (part === '$') {
      // This case should be resolved at collection time
      // If we still have '$', we need to skip for now
      return false;
    }

    // Navigate to the next level using bracket notation
    const next = current[part];
    if (!next) {
      warnMissingField(targetPath, logger, warningTracker);
      return false; // Path doesn't exist
    }
    current = next as FieldTreeRecord;
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
  parent: FieldTreeRecord,
  fieldKey: string,
  value: unknown,
  logger?: Logger,
  warningTracker?: DerivationWarningTracker,
): boolean {
  const fieldAccessor = parent[fieldKey];

  if (!fieldAccessor) {
    warnMissingField(fieldKey, logger, warningTracker);
    return false;
  }

  // Call the FieldTree to get the FieldState
  const fieldInstance = untracked(fieldAccessor);

  if (!fieldInstance || typeof fieldInstance !== 'object') {
    warnMissingField(fieldKey, logger, warningTracker);
    return false;
  }

  // Get the value signal and verify it's a WritableSignal
  const valueSignal = fieldInstance.value;

  if (isWritableSignal(valueSignal)) {
    // Writing directly to value.set() does NOT trigger markAsDirty() —
    // only user interaction through setControlValue() does. So derivation-applied
    // values leave the field pristine, and dirty() reliably indicates user edits.
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
 * Navigates the form tree to resolve a field instance at the given path.
 *
 * Walks the tree following the same pattern as `setFieldValue`:
 * each segment is looked up on the current node, and signal accessors
 * are called to get the next level.
 *
 * @returns The field instance object, or `undefined` if the path is invalid
 *
 * @internal
 */
function resolveFieldInstance(rootForm: FieldTree<unknown>, fieldPath: string): FieldState<unknown> | undefined {
  const parts = fieldPath.split('.');
  let current = rootForm as FieldTreeRecord;

  for (let i = 0; i < parts.length - 1; i++) {
    const next = current[parts[i]];
    if (!next) return undefined;
    current = next as FieldTreeRecord;
  }

  const fieldAccessor = current[parts[parts.length - 1]];
  if (!fieldAccessor) return undefined;

  return untracked(fieldAccessor);
}

/**
 * Reads the dirty() signal from a field at the given path.
 *
 * Returns `true` if the field is dirty, `false` if pristine,
 * or `undefined` if the field cannot be found.
 *
 * @internal
 */
function readFieldDirty(rootForm: FieldTree<unknown>, fieldPath: string): boolean | undefined {
  const fieldInstance = resolveFieldInstance(rootForm, fieldPath);
  if (!fieldInstance) return undefined;
  return untracked(fieldInstance.dirty);
}

/**
 * Resets a field's dirty/touched state at the given path.
 *
 * Used for re-engagement: when a dependency changes, clear the user override
 * so the derivation can re-apply.
 *
 * Uses the public `reset()` API on FieldState, which clears both
 * dirty and touched without changing the field's value.
 *
 * @internal
 */
function resetFieldState(rootForm: FieldTree<unknown>, fieldPath: string): void {
  const fieldInstance = resolveFieldInstance(rootForm, fieldPath);
  if (!fieldInstance) return;
  fieldInstance.reset();
}

/**
 * Checks whether any of the entry's dependencies appear in the changed fields set.
 *
 * **Known limitation for array derivations:** `changedFields` contains root-level keys
 * (e.g., `'lineItems'`) produced by `getChangedKeys()`, but array derivation dependencies
 * use relative names (e.g., `['quantity', 'unitPrice']`). This means `reEngageOnDependencyChange`
 * only fires for root-level dependencies (e.g., `'discountRate'`) — NOT for intra-item
 * dependencies like `'quantity'` within the same array item.
 *
 * Adding parent-key matching (checking if `entry.fieldKey.startsWith(changed + '.')`)
 * was attempted but causes false positives: editing the TARGET field also triggers
 * `changedFields = {'lineItems'}`, which would reset dirty immediately and break
 * `stopOnUserOverride`. Fixing this requires per-field change tracking instead of
 * per-root-key tracking — a more significant architectural change.
 *
 * @internal
 */
function hasDependencyChanged(entry: DerivationEntry, changedFields: Set<string>): boolean {
  return entry.dependsOn.some((dep) => dep === '*' || changedFields.has(dep));
}

/**
 * Checks whether a derivation should be skipped due to the user having manually
 * edited the target field. Handles re-engagement when `reEngageOnDependencyChange`
 * is set and a dependency has changed.
 *
 * @returns `true` if the derivation should be skipped, `false` otherwise
 *
 * @internal
 */
function shouldSkipForUserOverride(
  entry: DerivationEntry,
  resolvedFieldKey: string,
  context: DerivationApplicatorContext,
  chainContext: DerivationChainContext,
): boolean {
  if (!entry.stopOnUserOverride) return false;

  const isDirty = readFieldDirty(context.rootForm, resolvedFieldKey) ?? false;

  // If the field isn't dirty, no override to skip — and no re-engagement needed.
  // This also avoids wasteful resetFieldState calls on initial form render where
  // changedFields contains all keys (from startWith(null) + pairwise()) but fields
  // are all pristine.
  if (!isDirty) return false;

  // Re-engagement: reset dirty state if a dependency changed, allowing re-derivation
  if (entry.reEngageOnDependencyChange && chainContext.changedFields) {
    if (hasDependencyChanged(entry, chainContext.changedFields)) {
      resetFieldState(context.rootForm, resolvedFieldKey);
      // Re-read after reset — field is now pristine, so derivation proceeds
      return false;
    }
  }

  // Field is dirty and no re-engagement triggered — skip derivation
  return true;
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
