import { computed, inject, Signal } from '@angular/core';
import { SelectField } from '../../definitions';
import { RadioField } from '../../definitions';
import { MultiCheckboxField } from '../../definitions';
import { BaseValueField, DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES } from '@ng-forge/dynamic-forms';
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
  const ctx = resolveValueFieldContext();
  const defaultProps = inject(DEFAULT_PROPS);
  const defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES);

  return computed(() => {
    // Cast to BaseValueField - safe because all FieldWithOptions types extend BaseValueField
    const inputs = buildValueFieldInputs(fieldDef as BaseValueField<TProps, unknown>, ctx, defaultProps(), defaultValidationMessages());

    // Add options property
    inputs['options'] = fieldDef.options;

    return inputs;
  });
}
