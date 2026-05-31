import { Injector, Signal, type Type } from '@angular/core';
import type { FieldDef } from '@ng-forge/dynamic-forms/internal';

/** A single field within a resolved array item. */
export interface ResolvedArrayItemField {
  /** Field key (used for tracking and test IDs). */
  key: string;
  /** Original field definition — used by DfFieldOutlet to resolve wrappers. */
  fieldDef: FieldDef<unknown>;
  /** The loaded component type. */
  component: Type<unknown>;
  /** Injector providing ARRAY_CONTEXT and FIELD_SIGNAL_CONTEXT. */
  injector: Injector;
  /** Inputs signal for DfFieldOutlet — evaluated in template for reactivity. */
  inputs: Signal<Record<string, unknown>>;
  /** Whether required mapped inputs are available for safe component instantiation. */
  renderReady: Signal<boolean>;
  /**
   * Whether the array-item field is currently hidden — mirrors `ResolvedField.hidden`
   * so the same `@if (!field.hidden())` template gate works for top-level and
   * array-item fields.
   */
  hidden: Signal<boolean>;
}

/**
 * Resolved array item ready for declarative rendering with ngComponentOutlet.
 * Each item has a stable unique ID and a linkedSignal-based index that
 * automatically updates when items are added/removed.
 * Supports multiple fields per array item (e.g., name + email without a wrapper).
 */
export interface ResolvedArrayItem {
  /** Unique identifier for this item (stable across position changes). */
  id: string;
  /** All fields to render for this array item. */
  fields: ResolvedArrayItemField[];
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
  | { type: 'recreate' }
  | { type: 'none' };

/** Determines the optimal differential update operation based on current and new state. */
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
    // Items removed - must recreate because we don't know which items were removed.
    // shift() removes from index 0, removeAtIndex() removes from any position.
    // Each item's local form is initialized with its value at creation time and
    // doesn't reactively track parent array changes.
    return { type: 'recreate' };
  }

  // Same length - no structural change, items update via linkedSignal
  return { type: 'none' };
}
