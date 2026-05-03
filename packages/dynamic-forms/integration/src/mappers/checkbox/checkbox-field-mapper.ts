import { BaseCheckedField } from '@ng-forge/dynamic-forms';
import { FieldDef } from '@ng-forge/dynamic-forms';
import { computed, inject, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { buildBaseInputs, DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES } from '@ng-forge/dynamic-forms';
import { FIELD_SIGNAL_CONTEXT } from '@ng-forge/dynamic-forms';
import { omit } from '@ng-forge/dynamic-forms';

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
  const defaultProps = inject(DEFAULT_PROPS);
  const defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES);

  return computed(() => {
    const omittedFields = omit(fieldDef, ['value']) as FieldDef<unknown>;
    const baseInputs = buildBaseInputs(omittedFields, defaultProps());
    const validationMessages = defaultValidationMessages();

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      validationMessages: fieldDef.validationMessages ?? {},
    };

    if (fieldDef.placeholder !== undefined) {
      inputs['placeholder'] = fieldDef.placeholder;
    }

    if (validationMessages !== undefined) {
      inputs['defaultValidationMessages'] = validationMessages;
    }

    // Access form inside computed for reactivity and to handle cases where
    // form may not be immediately available (e.g., during array item initialization)
    const formRoot = context.form as Record<string, FieldTree<unknown> | undefined> | undefined;
    const fieldTree = formRoot?.[fieldDef.key];
    if (fieldTree !== undefined) {
      inputs['field'] = fieldTree;
    }

    return inputs;
  });
}
