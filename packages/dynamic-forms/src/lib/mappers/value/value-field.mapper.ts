import { BaseValueField } from '../../definitions/base/base-value-field';
import { computed, inject, isSignal, Signal } from '@angular/core';
import { buildBaseInputs } from '../base/base-field-mapper';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { omit } from '../../utils/object-utils';
import { getChildrenMap, getFieldProxy } from '../../utils/form-internals/form-internals';

/**
 * Maps a value field definition to component inputs.
 *
 * Value fields are input fields that contribute to the form's value (text, number, select, etc.).
 * This mapper injects FIELD_SIGNAL_CONTEXT to access the form structure and retrieve the field proxy.
 *
 * @param fieldDef The value field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function valueFieldMapper<T = unknown>(fieldDef: BaseValueField<T, string>): Signal<Record<string, unknown>> {
  const context = inject(FIELD_SIGNAL_CONTEXT);
  const omittedFields = omit(fieldDef, ['value']);

  // Build base inputs (static, from field definition)
  const baseInputs = buildBaseInputs(omittedFields);

  // Get form-level validation messages (static)
  const defaultValidationMessages = context.defaultValidationMessages;

  // Get the form root to access field proxy
  const formRoot = context.form();
  const childrenMap = getChildrenMap(formRoot);

  // Resolve field proxy (static - determined once during mapping)
  let fieldProxy: unknown = undefined;

  if (!childrenMap) {
    // No childrenMap - the form might be a FormRecord where fields are direct properties
    // First check if formRoot itself has fieldProxy (for FieldTree items)
    const rootFieldProxy = getFieldProxy(formRoot);
    if (rootFieldProxy) {
      fieldProxy = rootFieldProxy;
    } else {
      // Try accessing the field as a direct property on formRoot (FormRecord case)
      // This handles forms created with form(entity, schema) where fields are accessible as formRoot[key]
      const formField = (formRoot as unknown as Record<string, unknown>)[fieldDef.key];
      const resolvedProxy = getFieldProxy(formField);
      if (resolvedProxy) {
        fieldProxy = resolvedProxy;
      } else if (isSignal(formField) || formField) {
        // The field itself might be the proxy (signal), or might have a different structure
        // Try using the field directly as the proxy
        fieldProxy = formField;
      }
    }
  } else {
    // Standard field access for non-array keys via childrenMap lookup
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

    // Value field specific properties
    if (fieldDef.placeholder !== undefined) {
      inputs['placeholder'] = fieldDef.placeholder;
    }

    // Options property for select, radio, multi-checkbox fields
    const extendedFieldDef = fieldDef as BaseValueField<T, string> & {
      options?: unknown;
      minDate?: unknown;
      maxDate?: unknown;
      startAt?: unknown;
      min?: unknown;
      max?: unknown;
      step?: unknown;
      rows?: unknown;
      cols?: unknown;
    };

    if (extendedFieldDef.options !== undefined) {
      inputs['options'] = extendedFieldDef.options;
    }

    // Datepicker-specific properties
    if (extendedFieldDef.minDate !== undefined) {
      inputs['minDate'] = extendedFieldDef.minDate;
    }
    if (extendedFieldDef.maxDate !== undefined) {
      inputs['maxDate'] = extendedFieldDef.maxDate;
    }
    if (extendedFieldDef.startAt !== undefined) {
      inputs['startAt'] = extendedFieldDef.startAt;
    }

    // Slider/input-specific properties
    if (extendedFieldDef.min !== undefined) {
      inputs['min'] = extendedFieldDef.min;
    }
    if (extendedFieldDef.max !== undefined) {
      inputs['max'] = extendedFieldDef.max;
    }
    if (extendedFieldDef.step !== undefined) {
      inputs['step'] = extendedFieldDef.step;
    }

    // Textarea-specific properties
    if (extendedFieldDef.rows !== undefined) {
      inputs['rows'] = extendedFieldDef.rows;
    }
    if (extendedFieldDef.cols !== undefined) {
      inputs['cols'] = extendedFieldDef.cols;
    }

    if (defaultValidationMessages !== undefined) {
      inputs['defaultValidationMessages'] = defaultValidationMessages;
    }

    if (fieldProxy !== undefined) {
      inputs['field'] = fieldProxy;
    }

    return inputs;
  });
}
