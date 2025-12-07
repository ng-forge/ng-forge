import { computed, Signal } from '@angular/core';
import { SelectField } from '../../definitions/default/select-field';
import { RadioField } from '../../definitions/default/radio-field';
import { MultiCheckboxField } from '../../definitions/default/multi-checkbox-field';
import { BaseValueField } from '../../definitions/base/base-value-field';
import { resolveValueFieldContext, buildValueFieldInputs } from '../value/value-field.mapper';

/**
 * Field types that have an options property.
 */
export type FieldWithOptions<T = unknown, TProps = unknown> =
  | SelectField<T, TProps>
  | RadioField<T, TProps>
  | MultiCheckboxField<T, TProps>;

/**
 * Maps a field with options (select, radio, multi-checkbox) to component inputs.
 *
 * Extends the base value field mapper by adding the options property.
 *
 * @param fieldDef The field definition with options
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function optionsFieldMapper<T, TProps>(fieldDef: FieldWithOptions<T, TProps>): Signal<Record<string, unknown>> {
  const ctx = resolveValueFieldContext(fieldDef.key);

  return computed(() => {
    // Cast to BaseValueField - safe because all FieldWithOptions types extend BaseValueField
    const inputs = buildValueFieldInputs(fieldDef as BaseValueField<TProps, unknown>, ctx);

    // Add options property
    inputs['options'] = fieldDef.options;

    return inputs;
  });
}
