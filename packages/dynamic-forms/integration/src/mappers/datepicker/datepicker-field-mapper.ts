import { computed, inject, Signal } from '@angular/core';
import { DEFAULT_PROPS } from '@ng-forge/dynamic-forms';
import { DatepickerField } from '../../definitions';
import { resolveValueFieldContext, buildValueFieldInputs } from '../value/value-field.mapper';

/**
 * Converts a date value (string, Date, or null) to a Date object or null.
 * This ensures UI libraries that expect Date objects receive the correct type.
 */
function toDate(value: Date | string | null | undefined): Date | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  // Parse string to Date
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Maps a datepicker field to component inputs.
 *
 * @param fieldDef The datepicker field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function datepickerFieldMapper<TProps>(fieldDef: DatepickerField<TProps>): Signal<Record<string, unknown>> {
  const ctx = resolveValueFieldContext();
  const defaultProps = inject(DEFAULT_PROPS);

  return computed(() => {
    const inputs = buildValueFieldInputs(fieldDef, ctx, defaultProps());

    // Add datepicker-specific properties, converting strings to Date objects
    if (fieldDef.minDate !== undefined) {
      inputs['minDate'] = toDate(fieldDef.minDate);
    }
    if (fieldDef.maxDate !== undefined) {
      inputs['maxDate'] = toDate(fieldDef.maxDate);
    }
    if (fieldDef.startAt !== undefined) {
      inputs['startAt'] = toDate(fieldDef.startAt);
    }

    return inputs;
  });
}
