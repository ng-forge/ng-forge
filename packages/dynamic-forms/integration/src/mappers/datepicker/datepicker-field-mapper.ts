import { computed, inject, Signal } from '@angular/core';
import { DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES } from '@ng-forge/dynamic-forms';
import { DatepickerField } from '../../definitions';
import { resolveValueFieldContext, buildValueFieldInputs } from '../value/value-field.mapper';

/**
 * Maps a datepicker field to component inputs.
 *
 * Extends the base value field mapper by adding datepicker-specific properties:
 * - minDate: Minimum selectable date
 * - maxDate: Maximum selectable date
 * - startAt: Initial date to display when opening the picker
 *
 * @param fieldDef The datepicker field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function datepickerFieldMapper<TProps>(fieldDef: DatepickerField<TProps>): Signal<Record<string, unknown>> {
  const ctx = resolveValueFieldContext(fieldDef.key);
  const defaultProps = inject(DEFAULT_PROPS);
  const defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES);

  return computed(() => {
    const inputs = buildValueFieldInputs(fieldDef, ctx, defaultProps(), defaultValidationMessages());

    // Add datepicker-specific properties
    if (fieldDef.minDate !== undefined) {
      inputs['minDate'] = fieldDef.minDate;
    }
    if (fieldDef.maxDate !== undefined) {
      inputs['maxDate'] = fieldDef.maxDate;
    }
    if (fieldDef.startAt !== undefined) {
      inputs['startAt'] = fieldDef.startAt;
    }

    return inputs;
  });
}
