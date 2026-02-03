import { computed, inject, Signal } from '@angular/core';
import {
  AppendArrayItemEvent,
  ArrayAllowedChildren,
  buildBaseInputs,
  DEFAULT_PROPS,
  InsertArrayItemEvent,
  PopArrayItemEvent,
  PrependArrayItemEvent,
  RemoveAtIndexEvent,
  ShiftArrayItemEvent,
} from '@ng-forge/dynamic-forms';
import { buildArrayButtonEventContext, EventArg, resolveArrayButtonContext, resolveArrayButtonEventArgs } from './array-button.utils';

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
  /** Template defining the field structure for new items. REQUIRED. */
  template: readonly ArrayAllowedChildren[];
  /** Optional custom eventArgs */
  eventArgs?: readonly EventArg[];
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
 * Mapper for add array item button - appends new item to end of array.
 *
 * Preconfigures AppendArrayItemEvent with array context.
 * Template is REQUIRED to define the field structure for new items.
 *
 * @param fieldDef The add array item button field definition
 * @returns Signal containing component inputs
 */
export function addArrayItemButtonMapper<TProps>(fieldDef: BaseArrayAddButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'addArrayItem', fieldDef.arrayKey);

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: AppendArrayItemEvent,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, ['$arrayKey', '$template']),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx, fieldDef.template),
    };

    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for prepend array item button - inserts new item at beginning of array.
 *
 * Preconfigures PrependArrayItemEvent with array context.
 * Template is REQUIRED to define the field structure for new items.
 *
 * @param fieldDef The prepend array item button field definition
 * @returns Signal containing component inputs
 */
export function prependArrayItemButtonMapper<TProps>(fieldDef: BaseArrayAddButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'prependArrayItem', fieldDef.arrayKey);

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: PrependArrayItemEvent,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, ['$arrayKey', '$template']),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx, fieldDef.template),
    };

    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for insert array item button - inserts new item at specific index.
 *
 * Preconfigures InsertArrayItemEvent with array context.
 * Template and index are REQUIRED.
 *
 * @param fieldDef The insert array item button field definition
 * @returns Signal containing component inputs
 */
export function insertArrayItemButtonMapper<TProps>(fieldDef: BaseInsertArrayItemButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'insertArrayItem', fieldDef.arrayKey);

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: InsertArrayItemEvent,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, ['$arrayKey', fieldDef.index, '$template']),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx, fieldDef.template),
    };

    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

// =============================================================================
// Remove Array Item Mappers
// =============================================================================

/**
 * Mapper for remove array item button - removes item at current index.
 *
 * Behavior depends on placement:
 * - Inside array: RemoveAtIndexEvent (removes item at current index)
 * - Outside array: PopArrayItemEvent (removes last item)
 *
 * @param fieldDef The remove array item button field definition
 * @returns Signal containing component inputs
 */
export function removeArrayItemButtonMapper<TProps>(fieldDef: BaseArrayRemoveButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'removeArrayItem', fieldDef.arrayKey);

  // Choose event type based on context:
  // - Inside array: RemoveAtIndexEvent (remove specific item)
  // - Outside array: PopArrayItemEvent (remove last item)
  const eventType = ctx.isInsideArray ? RemoveAtIndexEvent : PopArrayItemEvent;
  const defaultEventArgs = ctx.isInsideArray ? ['$arrayKey', '$index'] : ['$arrayKey'];

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: eventType,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, defaultEventArgs),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx),
    };

    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for pop array item button - removes the last item from array.
 *
 * Preconfigures PopArrayItemEvent. Should be placed outside the array.
 * arrayKey is REQUIRED when placed outside an array context.
 *
 * @param fieldDef The pop array item button field definition
 * @returns Signal containing component inputs
 */
export function popArrayItemButtonMapper<TProps>(fieldDef: BaseArrayRemoveButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'popArrayItem', fieldDef.arrayKey);

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: PopArrayItemEvent,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, ['$arrayKey']),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx),
    };

    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}

/**
 * Mapper for shift array item button - removes the first item from array.
 *
 * Preconfigures ShiftArrayItemEvent. Should be placed outside the array.
 * arrayKey is REQUIRED when placed outside an array context.
 *
 * @param fieldDef The shift array item button field definition
 * @returns Signal containing component inputs
 */
export function shiftArrayItemButtonMapper<TProps>(fieldDef: BaseArrayRemoveButtonField<TProps>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const ctx = resolveArrayButtonContext(fieldDef.key, 'shiftArrayItem', fieldDef.arrayKey);

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps?.());

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      event: ShiftArrayItemEvent,
      eventArgs: resolveArrayButtonEventArgs(fieldDef.eventArgs, ['$arrayKey']),
      eventContext: buildArrayButtonEventContext(fieldDef.key, ctx),
    };

    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    return inputs;
  });
}
