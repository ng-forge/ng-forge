import { BaseCheckedField } from '../../definitions';
import { Binding, inputBinding, twoWayBinding, WritableSignal } from '@angular/core';
import { baseFieldMapper } from '../base/base-field-mapper';
import { FieldSignalContext, getFieldSignal } from '../utils/field-signal-utils';

export interface CheckboxFieldMapperOptions<TModel = any> {
  fieldSignalContext: FieldSignalContext<TModel>;
  fieldSignals: Map<string, WritableSignal<unknown>>;
}

export function checkboxFieldMapper(fieldDef: BaseCheckedField<any>, options?: CheckboxFieldMapperOptions): Binding[] {
  const bindings = baseFieldMapper(fieldDef);

  if (fieldDef.required) {
    bindings.push(inputBinding('required', () => fieldDef.required));
  }

  // Handle two-way binding if context is provided
  if (options) {
    const defaultValue = fieldDef.defaultValue ?? false;

    const fieldSignal = getFieldSignal(fieldDef.key, defaultValue, options.fieldSignalContext, options.fieldSignals);
    bindings.push(twoWayBinding('checked', fieldSignal));
  }

  return bindings;
}
