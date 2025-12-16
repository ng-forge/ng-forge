import { BaseCheckedField } from '../../definitions/base/base-checked-field';
import { FieldDef } from '../../definitions/base/field-def';
import { computed, inject, Signal } from '@angular/core';
import { buildBaseInputs } from '../base/base-field-mapper';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { omit } from '../../utils/object-utils';
import { FieldTree } from '@angular/forms/signals';

/**
 * Maps a checkbox/toggle field definition to component inputs.
 *
 * Checkbox fields are checked fields that contribute to the form's value as boolean.
 * This mapper injects FIELD_SIGNAL_CONTEXT to access the form structure and retrieve the field tree.
 *
 * @param fieldDef The checkbox field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function checkboxFieldMapper(fieldDef: BaseCheckedField<unknown>): Signal<Record<string, unknown>> {
  const context = inject(FIELD_SIGNAL_CONTEXT);
  const omittedFields = omit(fieldDef, ['value']) as FieldDef<unknown>;

  // Build base inputs (static, from field definition)
  const baseInputs = buildBaseInputs(omittedFields);

  // Get form-level validation messages (static)
  const defaultValidationMessages = context.defaultValidationMessages;

  // Access child field directly via bracket notation on the FieldTree
  // IMPORTANT: context.form IS the FieldTree, not a signal. Don't call it with ()!
  // FieldTree() returns FieldState (status signals), but FieldTree['key'] returns child FieldTree
  const formRoot = context.form;
  const fieldTree = (formRoot as unknown as Record<string, FieldTree<unknown>>)[fieldDef.key];

  // Return computed signal for reactive updates
  return computed(() => {
    const inputs: Record<string, unknown> = {
      ...baseInputs,
      // Always pass validationMessages (or empty object) - required for error display signals
      validationMessages: fieldDef.validationMessages ?? {},
    };

    // Checked field specific property: placeholder
    if (fieldDef.placeholder !== undefined) {
      inputs['placeholder'] = fieldDef.placeholder;
    }

    if (defaultValidationMessages !== undefined) {
      inputs['defaultValidationMessages'] = defaultValidationMessages;
    }

    if (fieldTree !== undefined) {
      inputs['field'] = fieldTree;
    }

    return inputs;
  });
}
