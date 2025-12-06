import { Injector, Signal, type Type } from '@angular/core';

/**
 * Generates a unique identifier for array items.
 * Uses crypto.randomUUID() for collision-free IDs that remain stable across position changes.
 */
export function generateArrayItemId(): string {
  return crypto.randomUUID();
}

/**
 * Resolved array item ready for declarative rendering with ngComponentOutlet.
 * Each item has a stable unique ID and a linkedSignal-based index that
 * automatically updates when items are added/removed.
 */
export interface ResolvedArrayItem {
  /** Unique identifier for this item (stable across position changes). */
  id: string;
  /** The loaded component type. */
  component: Type<unknown>;
  /** Injector providing ARRAY_CONTEXT and FIELD_SIGNAL_CONTEXT. */
  injector: Injector;
  /** Inputs signal for ngComponentOutlet - evaluated in template for reactivity. */
  inputs: Signal<Record<string, unknown>>;
  /** JSON snapshot of the value this item was created with (for differential comparison). */
  valueSnapshot: string;
}

/**
 * Creates a JSON snapshot of a value for differential update detection.
 * Used to compare array item values and determine if recreation is needed.
 */
export function createValueSnapshot(value: unknown): string {
  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '';
  }
}

/**
 * Safely extracts an array value from a model object.
 * Returns empty array if the key doesn't exist or value isn't an array.
 */
export function getArrayValue<TModel>(value: Partial<TModel> | undefined, key: string): unknown[] {
  const arrayValue = (value as Record<string, unknown>)?.[key];
  return Array.isArray(arrayValue) ? arrayValue : [];
}

/**
 * Discriminated union of possible differential update operations.
 * Enables optimized array updates without full recreation when possible.
 */
export type DifferentialUpdateOperation =
  | { type: 'clear' }
  | { type: 'initial'; fieldTreesLength: number }
  | { type: 'append'; startIndex: number; endIndex: number }
  | { type: 'pop'; newLength: number }
  | { type: 'recreate' }
  | { type: 'none' };

/**
 * Determines the optimal differential update operation based on current and new state.
 *
 * Compares resolved items against new array values to determine if we can:
 * - Clear all (empty array)
 * - Initial render (no existing items)
 * - Append only (items added at end, existing unchanged)
 * - Pop only (items removed from end, remaining unchanged)
 * - Skip update (no changes)
 * - Recreate all (any other change pattern)
 */
export function determineDifferentialOperation(
  currentItems: ResolvedArrayItem[],
  newLength: number,
  currentArrayValue: unknown[],
  checkValuesMatch: (newValues: unknown[], count: number) => boolean,
): DifferentialUpdateOperation {
  const currentLength = currentItems.length;

  if (newLength === 0) {
    return { type: 'clear' };
  }

  if (currentLength === 0) {
    return { type: 'initial', fieldTreesLength: newLength };
  }

  const minLength = Math.min(currentLength, newLength);

  if (newLength > currentLength) {
    const isPureAppend = checkValuesMatch(currentArrayValue, minLength);
    if (isPureAppend) {
      return { type: 'append', startIndex: currentLength, endIndex: newLength };
    }
  }

  if (newLength < currentLength) {
    const isPurePop = checkValuesMatch(currentArrayValue, newLength);
    if (isPurePop) {
      return { type: 'pop', newLength };
    }
  }

  if (newLength === currentLength) {
    const valuesMatch = checkValuesMatch(currentArrayValue, newLength);
    if (valuesMatch) {
      return { type: 'none' };
    }
  }

  return { type: 'recreate' };
}

/**
 * Checks if the first N values match between resolved items' snapshots and new values.
 * Uses pre-computed JSON snapshots for efficient comparison without deep equality checks.
 */
export function checkValuesMatch(resolvedItems: ResolvedArrayItem[], newValues: unknown[], count: number): boolean {
  if (resolvedItems.length < count || newValues.length < count) {
    return false;
  }

  for (let i = 0; i < count; i++) {
    const oldSnapshot = resolvedItems[i].valueSnapshot;
    const newSnapshot = createValueSnapshot(newValues[i]);

    if (oldSnapshot !== newSnapshot) {
      return false;
    }
  }
  return true;
}
