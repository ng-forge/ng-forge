import { BaseValueField } from '../../definitions/base/base-value-field';
import { computed, inject, Signal } from '@angular/core';
import { buildBaseInputs } from '../base/base-field-mapper';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { omit } from '../../utils/object-utils';
import { ValidationMessages } from '../../models/validation-types';
import { FieldTree } from '@angular/forms/signals';

/**
 * Context for value field mapping, containing resolved field tree and default validation messages.
 * Used by specialized mappers to avoid duplicate context resolution.
 */
export interface ValueFieldContext {
  fieldTree: FieldTree<unknown> | undefined;
  defaultValidationMessages: ValidationMessages | undefined;
}

/**
 * Resolves the field tree and default validation messages from the form context.
 * Must be called within an injection context.
 *
 * Uses direct bracket notation to access child FieldTrees from the parent form.
 * This is the official way to access nested fields in Angular Signal Forms.
 *
 * @param fieldKey The key of the field to resolve
 * @returns The resolved context with field tree and validation messages
 */
export function resolveValueFieldContext(fieldKey: string): ValueFieldContext {
  const context = inject(FIELD_SIGNAL_CONTEXT);

  // Get form-level validation messages
  const defaultValidationMessages = context.defaultValidationMessages;

  // Access child field directly via bracket notation on the FieldTree
  // IMPORTANT: context.form IS the FieldTree, not a signal. Don't call it with ()!
  // FieldTree() returns FieldState (status signals), but FieldTree['key'] returns child FieldTree
  const formRoot = context.form;
  const fieldTree = (formRoot as unknown as Record<string, FieldTree<unknown>>)[fieldKey];

  return { fieldTree, defaultValidationMessages };
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

  if (ctx.fieldTree !== undefined) {
    inputs['field'] = ctx.fieldTree;
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
