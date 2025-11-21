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

  if (!childrenMap) {
    // No childrenMap means formRoot is a FieldTree itself (e.g., for array items)
    // Access its fieldProxy just like we do for normal fields
    if ((formRoot as any).fieldProxy) {
      bindings.push(inputBinding('field', () => (formRoot as any).fieldProxy));
    }
  } else {
    // Standard field access for non-array keys via childrenMap lookup
    const formField = childrenMap?.get(fieldDef.key);
    if (formField?.fieldProxy) {
      bindings.push(inputBinding('field', () => formField.fieldProxy));
    }
  }

  return bindings;
}
