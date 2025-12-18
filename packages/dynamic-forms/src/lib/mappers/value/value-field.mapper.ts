import { BaseValueField } from '../../definitions/base/base-value-field';
import { computed, inject, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { buildBaseInputs } from '../base/base-field-mapper';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { omit } from '../../utils/object-utils';
import { ValidationMessages } from '../../models/validation-types';

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
 * Uses type-safe field tree utilities to access child FieldTrees from the parent form.
 *
 * @param fieldKey The key of the field to resolve
 * @returns The resolved context with field tree and validation messages
 */
export function resolveValueFieldContext(fieldKey: string): ValueFieldContext {
  const context = inject(FIELD_SIGNAL_CONTEXT);
  const defaultValidationMessages = context.defaultValidationMessages;
  const formRoot = context.form as Record<string, FieldTree<unknown> | undefined>;
  const fieldTree = formRoot[fieldKey];
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
    validationMessages: fieldDef.validationMessages ?? {},
  };

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
