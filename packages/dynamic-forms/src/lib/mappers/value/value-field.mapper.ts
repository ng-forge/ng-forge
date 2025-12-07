import { BaseValueField } from '../../definitions/base/base-value-field';
import { computed, inject, isSignal, Signal } from '@angular/core';
import { buildBaseInputs } from '../base/base-field-mapper';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { omit } from '../../utils/object-utils';
import { getChildrenMap, getFieldProxy } from '../../utils/form-internals/form-internals';
import { ValidationMessages } from '../../models/validation-types';

/**
 * Context for value field mapping, containing resolved field proxy and default validation messages.
 * Used by specialized mappers to avoid duplicate context resolution.
 */
export interface ValueFieldContext {
  fieldProxy: unknown;
  defaultValidationMessages: ValidationMessages | undefined;
}

/**
 * Resolves the field proxy and default validation messages from the form context.
 * Must be called within an injection context.
 *
 * @param fieldKey The key of the field to resolve
 * @returns The resolved context with field proxy and validation messages
 */
export function resolveValueFieldContext(fieldKey: string): ValueFieldContext {
  const context = inject(FIELD_SIGNAL_CONTEXT);

  // Get form-level validation messages
  const defaultValidationMessages = context.defaultValidationMessages;

  // Get the form root to access field proxy
  const formRoot = context.form();
  const childrenMap = getChildrenMap(formRoot);

  // Resolve field proxy
  let fieldProxy: unknown = undefined;

  if (!childrenMap) {
    // No childrenMap - the form might be a FormRecord where fields are direct properties
    // First check if formRoot itself has fieldProxy (for FieldTree items)
    const rootFieldProxy = getFieldProxy(formRoot);
    if (rootFieldProxy) {
      fieldProxy = rootFieldProxy;
    } else {
      // Try accessing the field as a direct property on formRoot (FormRecord case)
      // This handles forms created with form(entity, schema) where fields are accessible as formRoot[key]
      const formField = (formRoot as unknown as Record<string, unknown>)[fieldKey];
      const resolvedProxy = getFieldProxy(formField);
      if (resolvedProxy) {
        fieldProxy = resolvedProxy;
      } else if (isSignal(formField) || formField) {
        // The field itself might be the proxy (signal), or might have a different structure
        // Try using the field directly as the proxy
        fieldProxy = formField;
      }
    }
  } else {
    // Standard field access for non-array keys via childrenMap lookup
    const formField = childrenMap.get(fieldKey);
    const resolvedProxy = getFieldProxy(formField);
    if (resolvedProxy) {
      fieldProxy = resolvedProxy;
    }
  }

  return { fieldProxy, defaultValidationMessages };
}

/**
 * Builds the base inputs for a value field.
 * This is a helper function used by valueFieldMapper and specialized mappers.
 *
 * @param fieldDef The value field definition
 * @param ctx The resolved value field context
 * @returns Record of input names to values
 */
export function buildValueFieldInputs<TProps, TValue = unknown>(
  fieldDef: BaseValueField<TProps, TValue>,
  ctx: ValueFieldContext,
): Record<string, unknown> {
  const omittedFields = omit(fieldDef, ['value']);
  const baseInputs = buildBaseInputs(omittedFields);

  const inputs: Record<string, unknown> = {
    ...baseInputs,
    // Always pass validationMessages (or empty object) - required for error display signals
    validationMessages: fieldDef.validationMessages ?? {},
  };

  // Value field specific properties
  if (fieldDef.placeholder !== undefined) {
    inputs['placeholder'] = fieldDef.placeholder;
  }

  if (ctx.defaultValidationMessages !== undefined) {
    inputs['defaultValidationMessages'] = ctx.defaultValidationMessages;
  }

  if (ctx.fieldProxy !== undefined) {
    inputs['field'] = ctx.fieldProxy;
  }

  return inputs;
}

/**
 * Maps a value field definition to component inputs.
 *
 * Value fields are input fields that contribute to the form's value (text, number, etc.).
 * This mapper injects FIELD_SIGNAL_CONTEXT to access the form structure and retrieve the field proxy.
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
  const ctx = resolveValueFieldContext(fieldDef.key);

  return computed(() => buildValueFieldInputs(fieldDef, ctx));
}
