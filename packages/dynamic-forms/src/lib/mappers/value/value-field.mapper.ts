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
    // No childrenMap - the form might be a FormRecord where fields are direct properties
    // First check if formRoot itself has fieldProxy (for FieldTree items)
    if ((formRoot as any).fieldProxy) {
      bindings.push(inputBinding('field', () => (formRoot as any).fieldProxy));
    } else {
      // Try accessing the field as a direct property on formRoot (FormRecord case)
      // This handles forms created with form(entity, schema) where fields are accessible as formRoot[key]
      const formField = (formRoot as any)[fieldDef.key];
      if (formField?.fieldProxy) {
        bindings.push(inputBinding('field', () => formField.fieldProxy));
      } else if (typeof formField === 'function' || formField) {
        // The field itself might be the proxy, or might have a different structure
        // Try using the field directly as the proxy
        bindings.push(inputBinding('field', () => formField));
      }
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
