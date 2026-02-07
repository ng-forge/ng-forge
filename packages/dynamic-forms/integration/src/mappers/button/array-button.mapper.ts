import { computed, inject, Signal } from '@angular/core';
import {
  AppendArrayItemEvent,
  ArrayAllowedChildren,
  buildBaseInputs,
  DEFAULT_PROPS,
  InsertArrayItemEvent,
  NonFieldLogicConfig,
  PopArrayItemEvent,
  PrependArrayItemEvent,
  RemoveAtIndexEvent,
  RootFormRegistryService,
  ShiftArrayItemEvent,
} from '@ng-forge/dynamic-forms';
import { buildArrayButtonEventContext, EventArg, resolveArrayButtonContext, resolveArrayButtonEventArgs } from './array-button.utils';
import { applyNonFieldLogic } from './non-field-logic.utils';

// =============================================================================
// Base Interfaces
// =============================================================================

/**
 * Base interface for array add button fields (append, prepend, insert).
 * Template is required to define the structure for new items.
 */
export interface BaseArrayAddButtonField<TProps = unknown> {
  key: string;
  type: string;
  label?: string;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
  props?: TProps;
  /** Target array key (required when outside array, optional inside) */
  arrayKey?: string;
  /**
   * Template defining the field structure for new items. REQUIRED.
   * - Single field (ArrayAllowedChildren): Creates a primitive item (field's value is extracted directly)
   * - Array of fields (ArrayAllowedChildren[]): Creates an object item (fields merged into object)
   */
  template: ArrayAllowedChildren | readonly ArrayAllowedChildren[];
  /** Optional custom eventArgs */
  eventArgs?: readonly EventArg[];
  /** Logic rules for dynamic hidden/disabled state (only hidden and disabled are supported) */
  logic?: NonFieldLogicConfig[];
}

/**
 * Base interface for array remove button fields (remove, pop, shift).
 * No template needed - removes existing items.
 */
export interface BaseArrayRemoveButtonField<TProps = unknown> {
  key: string;
  type: string;
  label?: string;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
  props?: TProps;
  /** Target array key (required when outside array, optional inside) */
  arrayKey?: string;
  /** Optional custom eventArgs */
  eventArgs?: readonly EventArg[];
  /** Logic rules for dynamic hidden/disabled state (only hidden and disabled are supported) */
  logic?: NonFieldLogicConfig[];
}

/**
 * Interface for insert array item button fields.
 * Extends add button with required index.
 */
export interface BaseInsertArrayItemButtonField<TProps = unknown> extends BaseArrayAddButtonField<TProps> {
  /** The index at which to insert the new item */
  index: number;
}

// =============================================================================
// Add Array Item Mappers
// =============================================================================

/**
 * Mapper for add array item button — appends new item to end of array.
 * Template is REQUIRED to define the field structure for new items.
 */
export function addArrayItemButtonMapper<TProps>(fieldDef: BaseArrayAddButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const rootFormRegistry = inject(RootFormRegistryService);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'addArrayItem', fieldDef.arrayKey);

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    return {
      ...baseInputs,
      event: AppendArrayItemEvent,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, ['$arrayKey', '$template']),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx, fieldDef.template),
      ...applyNonFieldLogic(rootFormRegistry, fieldDef),
    };
  });
}

/**
 * Mapper for prepend array item button — inserts new item at beginning of array.
 * Template is REQUIRED to define the field structure for new items.
 */
export function prependArrayItemButtonMapper<TProps>(fieldDef: BaseArrayAddButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const rootFormRegistry = inject(RootFormRegistryService);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'prependArrayItem', fieldDef.arrayKey);

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    return {
      ...baseInputs,
      event: PrependArrayItemEvent,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, ['$arrayKey', '$template']),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx, fieldDef.template),
      ...applyNonFieldLogic(rootFormRegistry, fieldDef),
    };
  });
}

/**
 * Mapper for insert array item button — inserts new item at specific index.
 * Template and index are REQUIRED.
 */
export function insertArrayItemButtonMapper<TProps>(fieldDef: BaseInsertArrayItemButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const rootFormRegistry = inject(RootFormRegistryService);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'insertArrayItem', fieldDef.arrayKey);

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    return {
      ...baseInputs,
      event: InsertArrayItemEvent,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, ['$arrayKey', fieldDef.index, '$template']),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx, fieldDef.template),
      ...applyNonFieldLogic(rootFormRegistry, fieldDef),
    };
  });
}

// =============================================================================
// Remove Array Item Mappers
// =============================================================================

/**
 * Mapper for remove array item button.
 * Inside array: RemoveAtIndexEvent. Outside array: PopArrayItemEvent.
 */
export function removeArrayItemButtonMapper<TProps>(fieldDef: BaseArrayRemoveButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const rootFormRegistry = inject(RootFormRegistryService);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'removeArrayItem', fieldDef.arrayKey);

  // Choose event type based on context:
  // - Inside array: RemoveAtIndexEvent (remove specific item)
  // - Outside array: PopArrayItemEvent (remove last item)
  const eventType = ctx.isInsideArray ? RemoveAtIndexEvent : PopArrayItemEvent;
  const defaultEventArgs = ctx.isInsideArray ? ['$arrayKey', '$index'] : ['$arrayKey'];

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    return {
      ...baseInputs,
      event: eventType,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, defaultEventArgs),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx),
      ...applyNonFieldLogic(rootFormRegistry, fieldDef),
    };
  });
}

/** Mapper for pop array item button — removes the last item from array. */
export function popArrayItemButtonMapper<TProps>(fieldDef: BaseArrayRemoveButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const rootFormRegistry = inject(RootFormRegistryService);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'popArrayItem', fieldDef.arrayKey);

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    return {
      ...baseInputs,
      event: PopArrayItemEvent,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, ['$arrayKey']),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx),
      ...applyNonFieldLogic(rootFormRegistry, fieldDef),
    };
  });
}

/** Mapper for shift array item button — removes the first item from array. */
export function shiftArrayItemButtonMapper<TProps>(fieldDef: BaseArrayRemoveButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const rootFormRegistry = inject(RootFormRegistryService);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'shiftArrayItem', fieldDef.arrayKey);

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    return {
      ...baseInputs,
      event: ShiftArrayItemEvent,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, ['$arrayKey']),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx),
      ...applyNonFieldLogic(rootFormRegistry, fieldDef),
    };
  });
}
