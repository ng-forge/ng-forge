import { BaseValueField } from '@ng-forge/dynamic-forms';
import { computed, inject, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { buildBaseInputs, DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES } from '@ng-forge/dynamic-forms';
import { FIELD_SIGNAL_CONTEXT } from '@ng-forge/dynamic-forms';
import { omit } from '@ng-forge/dynamic-forms';
import { ValidationMessages } from '@ng-forge/dynamic-forms';

/**
 * Context for value field mapping, containing the injected context reference.
 * Used by specialized mappers to avoid duplicate injection.
 *
 * Note: The field tree is resolved lazily via getFieldTree() to support
 * reactive form access (e.g., for array items where the form structure
 * may not exist at injection time but becomes available later).
 */
export interface ValueFieldContext {
  /**
   * Gets the field tree for a given key from the form context.
   * This is reactive for array items - the form getter is evaluated each time,
   * allowing the computed to re-run when the root form structure updates.
   */
  getFieldTree: (fieldKey: string) => FieldTree<unknown> | undefined;
}

/**
 * Creates a value field context from the injected FIELD_SIGNAL_CONTEXT.
 * Must be called within an injection context.
 *
 * With direct root form binding for array items, the FIELD_SIGNAL_CONTEXT.form
 * uses a getter that evaluates reactively. This means:
 * - For regular fields: direct access to the form's FieldTree
 * - For array items: the getter resolves rootForm['arrayKey'][index] dynamically
 *
 * The returned context provides a getFieldTree function that should be called
 * inside a computed to establish proper reactive dependencies.
 *
 * @returns The value field context with reactive field tree accessor
 */
export function resolveValueFieldContext(): ValueFieldContext {
  const context = inject(FIELD_SIGNAL_CONTEXT);

  return {
    getFieldTree: (fieldKey: string) => {
      // Access context.form here (inside a function that will be called from a computed)
      // This allows the getter to be evaluated reactively
      const formRoot = context.form as Record<string, FieldTree<unknown> | undefined> | undefined;

      // Handle case where form is undefined (e.g., newly added array items before root form updates)
      if (!formRoot) {
        return undefined;
      }

      return formRoot[fieldKey];
    },
  };
}

/**
 * Builds the base inputs for a value field.
 * This is a helper function used by valueFieldMapper and specialized mappers.
 *
 * Note: This function should be called inside a computed signal to ensure
 * proper reactive dependency tracking for the field tree resolution.
 *
 * @param fieldDef The value field definition
 * @param ctx The resolved value field context
 * @param defaultProps Default props from the form configuration (may be undefined if not configured)
 * @param defaultValidationMessages Default validation messages from the form configuration (may be undefined if not configured)
 * @returns Record of input names to values
 */
export function buildValueFieldInputs<TProps, TValue = unknown>(
  fieldDef: BaseValueField<TProps, TValue>,
  ctx: ValueFieldContext,
  defaultProps?: Record<string, unknown>,
  defaultValidationMessages?: ValidationMessages,
): Record<string, unknown> {
  const omittedFields = omit(fieldDef, ['value']);
  const baseInputs = buildBaseInputs(omittedFields, defaultProps);

  const inputs: Record<string, unknown> = {
    ...baseInputs,
    validationMessages: fieldDef.validationMessages ?? {},
  };

  if (fieldDef.placeholder !== undefined) {
    inputs['placeholder'] = fieldDef.placeholder;
  }

  if (defaultValidationMessages !== undefined) {
    inputs['defaultValidationMessages'] = defaultValidationMessages;
  }

  // Resolve field tree reactively - this call is inside a computed,
  // so it establishes the reactive dependency correctly
  const fieldTree = ctx.getFieldTree(fieldDef.key);
  if (fieldTree !== undefined) {
    inputs['field'] = fieldTree;
  }

  return inputs;
}

/**
 * Maps a value field definition to component inputs.
 *
 * Value fields are input fields that contribute to the form's value (text, number, etc.).
 * This mapper injects FIELD_SIGNAL_CONTEXT to access the form structure and retrieve the field proxy.
 *
 * For array items, the FIELD_SIGNAL_CONTEXT.form uses a reactive getter that resolves
 * rootForm['arrayKey'][index] dynamically. This means:
 * - Zod/StandardSchema validation errors are automatically available
 * - The field tree updates reactively when the root form structure changes
 * - Newly added array items will get their field tree once the form value updates
 *
 * For fields with specific properties (select, datepicker, textarea, slider), use the specialized mappers:
 * - selectFieldMapper: for fields with options (select, radio, multi-checkbox)
 * - datepickerFieldMapper: for fields with minDate, maxDate, startAt
 * - textareaFieldMapper: for fields with rows, cols
 * - sliderFieldMapper: for fields with minValue, maxValue, step
 *
 * @param fieldDef The value field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function valueFieldMapper<TProps = unknown, TValue = unknown>(
  fieldDef: BaseValueField<TProps, TValue>,
): Signal<Record<string, unknown>> {
  // Get the context once at injection time (captures the FIELD_SIGNAL_CONTEXT reference)
  const ctx = resolveValueFieldContext();
  const defaultProps = inject(DEFAULT_PROPS);
  const defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES);

  // The computed calls ctx.getFieldTree(fieldDef.key) inside, which:
  // 1. Accesses context.form (triggering the getter for array items)
  // 2. Returns the field tree if available, or undefined if not yet
  // 3. Re-runs when the form structure updates (reactive dependency)
  return computed(() => {
    return buildValueFieldInputs(fieldDef, ctx, defaultProps(), defaultValidationMessages());
  });
}
