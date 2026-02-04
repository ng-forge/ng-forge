import { computed, inject, Signal } from '@angular/core';
import { ARRAY_CONTEXT, ArrayAllowedChildren, DynamicFormLogger } from '@ng-forge/dynamic-forms';

/**
 * Context for array button mapping, containing resolved array information.
 * Used by array button mappers to build event context.
 */
export interface ArrayButtonContext {
  /** The target array key (from explicit arrayKey or ARRAY_CONTEXT) */
  targetArrayKey: string | undefined;
  /** Computed signal that returns the current array index (-1 if not inside array) */
  indexSignal: Signal<number>;
  /** The current form value for token resolution */
  formValue: Record<string, unknown>;
  /** Whether this button is inside an array context */
  isInsideArray: boolean;
}

/**
 * Event context passed to button components for array operations.
 */
export interface ArrayButtonEventContext {
  /** The button field key */
  key: string;
  /** The current array index (-1 if outside array) */
  index: number;
  /** The target array key */
  arrayKey: string;
  /** The form value for token resolution */
  formValue: Record<string, unknown>;
  /**
   * Optional template for add operations.
   * Can be a single field (primitive item) or array of fields (object item).
   */
  template?: ArrayAllowedChildren | readonly ArrayAllowedChildren[];
}

/**
 * Resolves array button context for button mappers.
 *
 * Handles both inside-array (context from ARRAY_CONTEXT) and
 * outside-array (explicit arrayKey) placements.
 *
 * Must be called in injection context.
 *
 * @param fieldKey The button field key (for logging)
 * @param buttonType The button type name (for logging)
 * @param explicitArrayKey Optional explicit arrayKey from field definition
 * @returns The array button context with reactive index signal
 */
export function resolveArrayButtonContext(fieldKey: string, buttonType: string, explicitArrayKey?: string): ArrayButtonContext {
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });
  const logger = inject(DynamicFormLogger);

  // Priority: explicit arrayKey from fieldDef > arrayKey from context
  const targetArrayKey = explicitArrayKey ?? arrayContext?.arrayKey;

  if (!targetArrayKey) {
    logger.warn(
      `${buttonType} button "${fieldKey}" has no array context. ` +
        'Either place it inside an array field, or provide an explicit arrayKey property.',
    );
  }

  // Create index signal once at injection time - computed to track arrayContext.index changes
  const indexSignal = computed(() => {
    if (!arrayContext) return -1;
    return arrayContext.index();
  });

  return {
    targetArrayKey,
    indexSignal,
    formValue: (arrayContext?.formValue ?? {}) as Record<string, unknown>,
    isInsideArray: arrayContext !== null,
  };
}

/**
 * Builds the event context passed to the button component.
 *
 * Should be called inside a computed to track index signal changes.
 *
 * @param fieldKey The button field key
 * @param ctx The resolved array button context
 * @param template Optional template for add operations (single field or array of fields)
 * @returns The event context for the button component
 */
export function buildArrayButtonEventContext(
  fieldKey: string,
  ctx: ArrayButtonContext,
  template?: ArrayAllowedChildren | readonly ArrayAllowedChildren[],
): ArrayButtonEventContext {
  const eventContext: ArrayButtonEventContext = {
    key: fieldKey,
    index: ctx.indexSignal(), // Evaluated inside computed
    arrayKey: ctx.targetArrayKey ?? '',
    formValue: ctx.formValue,
  };

  if (template) {
    eventContext.template = template;
  }

  return eventContext;
}

/**
 * Event argument type - supports static values and tokens.
 * Tokens: $key, $index, $arrayKey, $template, formValue
 */
export type EventArg = string | number | boolean | null | undefined;

/**
 * Resolves eventArgs with defaults for array buttons.
 *
 * @param fieldEventArgs The eventArgs from field definition (may be undefined)
 * @param defaultEventArgs The default eventArgs to use if not specified
 * @returns The resolved eventArgs array
 */
export function resolveArrayButtonEventArgs(
  fieldEventArgs: readonly EventArg[] | undefined,
  defaultEventArgs: readonly EventArg[] = ['$arrayKey', '$template'],
): readonly EventArg[] {
  return fieldEventArgs ?? defaultEventArgs;
}
