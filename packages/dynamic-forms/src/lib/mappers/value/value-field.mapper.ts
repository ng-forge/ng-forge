import { BaseValueField } from '../../definitions/base/base-value-field';
import { Binding, inject, inputBinding, isSignal } from '@angular/core';
import { baseFieldMapper } from '../base/base-field-mapper';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { omit } from '../../utils/object-utils';
import { getChildrenMap, getFieldProxy } from '../../utils/form-internals';

export function valueFieldMapper<T = unknown>(fieldDef: BaseValueField<T, string>): Binding[] {
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
  const childrenMap = getChildrenMap(formRoot);

  if (!childrenMap) {
    // No childrenMap - the form might be a FormRecord where fields are direct properties
    // First check if formRoot itself has fieldProxy (for FieldTree items)
    const rootFieldProxy = getFieldProxy(formRoot);
    if (rootFieldProxy) {
      bindings.push(inputBinding('field', () => rootFieldProxy));
    } else {
      // Try accessing the field as a direct property on formRoot (FormRecord case)
      // This handles forms created with form(entity, schema) where fields are accessible as formRoot[key]
      const formField = (formRoot as unknown as Record<string, unknown>)[fieldDef.key];
      const fieldProxy = getFieldProxy(formField);
      if (fieldProxy) {
        bindings.push(inputBinding('field', () => fieldProxy));
      } else if (isSignal(formField) || formField) {
        // The field itself might be the proxy (signal), or might have a different structure
        // Try using the field directly as the proxy
        bindings.push(inputBinding('field', () => formField));
      }
    }
  } else {
    // Standard field access for non-array keys via childrenMap lookup
    const formField = childrenMap.get(fieldDef.key);
    const fieldProxy = getFieldProxy(formField);
    if (fieldProxy) {
      bindings.push(inputBinding('field', () => fieldProxy));
    }
  }

  return bindings;
}
