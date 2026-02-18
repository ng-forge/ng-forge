import { isWritableSignal, untracked } from '@angular/core';
import type { FieldState, FieldTree } from '@angular/forms/signals';
import type { FieldTreeRecord } from '../field-tree-utils';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DerivationWarningTracker } from './derivation-warning-tracker';

/**
 * Error message prefix for derivation-related errors.
 * @internal
 */
const ERROR_PREFIX = '[Derivation]';

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
export function resolveFieldInstance(rootForm: FieldTree<unknown>, fieldPath: string): FieldState<unknown> | undefined {
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
export function readFieldDirty(rootForm: FieldTree<unknown>, fieldPath: string): boolean | undefined {
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
export function resetFieldState(rootForm: FieldTree<unknown>, fieldPath: string): void {
  const fieldInstance = resolveFieldInstance(rootForm, fieldPath);
  if (!fieldInstance) return;
  fieldInstance.reset();
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
export function applyValueToForm(
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
export function warnMissingField(fieldKey: string, logger?: Logger, warningTracker?: DerivationWarningTracker): void {
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
