import { BaseCheckedField } from '../../definitions/base/base-checked-field';
import { FieldDef } from '../../definitions/base/field-def';
import { computed, inject, Signal } from '@angular/core';
import { buildBaseInputs } from '../base/base-field-mapper';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { omit } from '../../utils/object-utils';
import { getChildrenMap, getFieldProxy } from '../../utils/form-internals/form-internals';

/**
 * Maps a checkbox/toggle field definition to component inputs.
 *
 * Checkbox fields are checked fields that contribute to the form's value as boolean.
 * This mapper injects FIELD_SIGNAL_CONTEXT to access the form structure and retrieve the field proxy.
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

  // Get the form root to access field proxy
  const formRoot = context.form();
  const childrenMap = getChildrenMap(formRoot);

  // Resolve field proxy (static - determined once during mapping)
  let fieldProxy: unknown = undefined;

  if (childrenMap) {
    const formField = childrenMap.get(fieldDef.key);
    const resolvedProxy = getFieldProxy(formField);
    if (resolvedProxy) {
      fieldProxy = resolvedProxy;
    }
  }

  // Return computed signal for reactive updates
  return computed(() => {
    const inputs: Record<string, unknown> = {
      ...baseInputs,
      // Always pass validationMessages (or empty object) - required for error display signals
      validationMessages: fieldDef.validationMessages ?? {},
    };

    if (defaultValidationMessages !== undefined) {
      inputs['defaultValidationMessages'] = defaultValidationMessages;
    }

    if (fieldProxy !== undefined) {
      inputs['field'] = fieldProxy;
    }

    return inputs;
  });
}
