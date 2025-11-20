import { BaseValueField } from '../../definitions';
import { Binding, inject, inputBinding } from '@angular/core';
import { baseFieldMapper } from '../base/base-field-mapper';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { omit } from '../../utils/object-utils';

export function valueFieldMapper(fieldDef: BaseValueField<any, any>): Binding[] {
  const context = inject(FIELD_SIGNAL_CONTEXT);
  const omittedFields = omit(fieldDef, ['value']);

  const bindings: Binding[] = baseFieldMapper(omittedFields);

  // Always pass validationMessages (or empty object) - required for error display signals
  bindings.push(inputBinding('validationMessages', () => fieldDef.validationMessages ?? {}));

  // Pass form-level validation messages for fallback error translations
  const defaultValidationMessages = context.defaultValidationMessages;
  if (defaultValidationMessages !== undefined) {
    bindings.push(inputBinding('defaultValidationMessages', () => defaultValidationMessages));
  }

  const formRoot = context.form();
  const childrenMap = (formRoot as any).structure?.childrenMap?.();

  // Check if this is an array item field (has array notation like tags[0])
  const arrayMatch = fieldDef.key.match(/^(.+)\[(\d+)\]$/);

  if (arrayMatch) {
    // Parse array notation to extract array name and index
    const [, arrayName, indexStr] = arrayMatch;
    const index = parseInt(indexStr, 10);

    // Access the array field node, then the element at the index
    const arrayFieldNode = childrenMap?.get(arrayName);
    const arrayItemFieldProxy = arrayFieldNode?.fieldProxy?.[index];

    if (arrayItemFieldProxy) {
      bindings.push(inputBinding('field', () => arrayItemFieldProxy));
    }
  } else {
    // Standard field access for non-array keys
    const formField = childrenMap?.get(fieldDef.key);
    if (formField?.fieldProxy) {
      bindings.push(inputBinding('field', () => formField.fieldProxy));
    }
  }

  return bindings;
}
