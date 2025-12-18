import { BaseCheckedField } from '../../definitions/base/base-checked-field';
import { FieldDef } from '../../definitions/base/field-def';
import { computed, inject, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { buildBaseInputs } from '../base/base-field-mapper';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { omit } from '../../utils/object-utils';

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
  const baseInputs = buildBaseInputs(omittedFields);
  const defaultValidationMessages = context.defaultValidationMessages;
  const formRoot = context.form as Record<string, FieldTree<unknown> | undefined>;
  const fieldTree = formRoot[fieldDef.key];

  return computed(() => {
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

    if (fieldTree !== undefined) {
      inputs['field'] = fieldTree;
    }

    return inputs;
  });
}
