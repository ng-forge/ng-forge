import { Injector, Signal, type Type } from '@angular/core';

/**
 * Generates a unique identifier for array items.
 * Uses crypto.randomUUID() for truly unique, collision-free IDs.
 * This is a pure function with no side effects.
 */
export function generateArrayItemId(): string {
  return crypto.randomUUID();
}

/**
 * Resolved array item ready for declarative rendering with ngComponentOutlet.
 * Each item has a unique ID and a linkedSignal-based index that
 * automatically updates when items are added/removed.
 */
export interface ResolvedArrayItem {
  /** Unique identifier for this item (stable across position changes) */
  id: string;
  /** The loaded component type */
  component: Type<unknown>;
  /** The injector used for this item (with ARRAY_CONTEXT and FIELD_SIGNAL_CONTEXT) */
  injector: Injector;
  /** Inputs signal for ngComponentOutlet - evaluated in template for reactivity */
  inputs: Signal<Record<string, unknown>>;
  /** JSON snapshot of the value this item was created with (for differential comparison) */
  valueSnapshot: string;
}

/**
 * Creates a JSON snapshot of a value for comparison purposes.
 * Used for differential update detection in array fields.
 *
 * @param value - The value to snapshot
 * @returns JSON string representation of the value, or empty string on error
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
 *
 * @param value - The parent model object
 * @param key - The key of the array property
 * @returns The array value, or empty array if not found or not an array
 */
export function getArrayValue<TModel>(value: Partial<TModel> | undefined, key: string): unknown[] {
  const arrayValue = (value as Record<string, unknown>)?.[key];
  return Array.isArray(arrayValue) ? arrayValue : [];
}

/**
 * Determines the type of differential update operation needed.
 */
export type DifferentialUpdateOperation =
  | { type: 'clear' }
  | { type: 'initial'; fieldTreesLength: number }
  | { type: 'append'; startIndex: number; endIndex: number }
  | { type: 'pop'; newLength: number }
  | { type: 'recreate' }
  | { type: 'none' };

/**
 * Determines the differential update operation needed based on current and new state.
 *
 * @param currentItems - Current resolved items
 * @param newLength - Length of the new field trees
 * @param currentArrayValue - Current array values from the form
 * @param checkValuesMatch - Function to check if values match at given count
 * @returns The operation to perform
 */
export function determineDifferentialOperation(
  currentItems: ResolvedArrayItem[],
  newLength: number,
  currentArrayValue: unknown[],
  checkValuesMatch: (newValues: unknown[], count: number) => boolean,
): DifferentialUpdateOperation {
  const currentLength = currentItems.length;

  // Handle empty arrays
  if (newLength === 0) {
    return { type: 'clear' };
  }

  // Handle initial render (no existing items)
  if (currentLength === 0) {
    return { type: 'initial', fieldTreesLength: newLength };
  }

  // Determine operation type by comparing values
  const minLength = Math.min(currentLength, newLength);

  if (newLength > currentLength) {
    // Items were added - check if it's a pure append
    const isPureAppend = checkValuesMatch(currentArrayValue, minLength);
    if (isPureAppend) {
      return { type: 'append', startIndex: currentLength, endIndex: newLength };
    }
  }

  if (newLength < currentLength) {
    // Items were removed - check if it's a pure pop (remove from end)
    const isPurePop = checkValuesMatch(currentArrayValue, newLength);
    if (isPurePop) {
      return { type: 'pop', newLength };
    }
  }

  // If lengths are equal and values match, no update needed
  if (newLength === currentLength) {
    const valuesMatch = checkValuesMatch(currentArrayValue, newLength);
    if (valuesMatch) {
      return { type: 'none' };
    }
  }

  // Recreate all for any other operation (middle insert/remove, value change)
  return { type: 'recreate' };
}

/**
 * Checks if the first N values match between resolved items' snapshots and new values.
 * Uses pre-computed JSON snapshots for comparison.
 *
 * @param resolvedItems - Current resolved items with value snapshots
 * @param newValues - New array values to compare
 * @param count - Number of items to compare
 * @returns true if all values match
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
