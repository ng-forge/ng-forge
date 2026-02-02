import { Injector, Signal, type Type } from '@angular/core';
import { extractSuffixFromUuid } from './key-suffix';

/**
 * Generates a unique identifier and suffix for array items.
 * Uses crypto.randomUUID() for collision-free IDs that remain stable across position changes.
 * The suffix is an 8-char hex string extracted from the UUID for key suffixing.
 */
export function generateArrayItemIdAndSuffix(): { id: string; suffix: string } {
  const id = crypto.randomUUID();
  const suffix = extractSuffixFromUuid(id);
  return { id, suffix };
}

/**
 * Resolved array item ready for declarative rendering with ngComponentOutlet.
 * Each item has a stable unique ID and a linkedSignal-based index that
 * automatically updates when items are added/removed.
 */
export interface ResolvedArrayItem {
  /** Unique identifier for this item (stable across position changes). */
  id: string;
  /** 8-char suffix derived from UUID, used for key suffixing to avoid DOM ID collisions. */
  suffix: string;
  /** The loaded component type. */
  component: Type<unknown>;
  /** Injector providing ARRAY_CONTEXT and FIELD_SIGNAL_CONTEXT. */
  injector: Injector;
  /** Inputs signal for ngComponentOutlet - evaluated in template for reactivity. */
  inputs: Signal<Record<string, unknown>>;
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
 * Operations:
 * - Clear all (empty array)
 * - Initial render (no existing items)
 * - Append only (items added at end)
 * - Pop only (items removed from end)
 * - None (same length - items update via linkedSignal)
 */
export function determineDifferentialOperation(currentItems: ResolvedArrayItem[], newLength: number): DifferentialUpdateOperation {
  const currentLength = currentItems.length;

  if (newLength === 0) {
    return { type: 'clear' };
  }

  if (currentLength === 0) {
    return { type: 'initial', fieldTreesLength: newLength };
  }

  // For all length changes, we optimize by assuming existing items stay in place.
  // Items handle their own value updates via linkedSignal - no need to compare snapshots.
  // Snapshot comparison was causing false "recreate" when existing items had been edited.

  if (newLength > currentLength) {
    // Items added - append new ones, existing items stay
    return { type: 'append', startIndex: currentLength, endIndex: newLength };
  }

  if (newLength < currentLength) {
    // Items removed - pop from end, remaining items stay
    return { type: 'pop', newLength };
  }

  // Same length - no structural change, items update via linkedSignal
  return { type: 'none' };
}
