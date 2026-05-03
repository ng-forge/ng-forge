import { computed, inject, Signal } from '@angular/core';
import { DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES } from '@ng-forge/dynamic-forms';
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
 * Extends the base value field mapper by adding datepicker-specific properties:
 * - minDate: Minimum selectable date
 * - maxDate: Maximum selectable date
 * - startAt: Initial date to display when opening the picker
 *
 * Date values are automatically converted from strings to Date objects
 * since UI libraries (Material, PrimeNG, etc.) expect Date objects.
 *
 * @param fieldDef The datepicker field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function datepickerFieldMapper<TProps>(fieldDef: DatepickerField<TProps>): Signal<Record<string, unknown>> {
  const ctx = resolveValueFieldContext();
  const defaultProps = inject(DEFAULT_PROPS);
  const defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES);

  return computed(() => {
    const inputs = buildValueFieldInputs(fieldDef, ctx, defaultProps(), defaultValidationMessages());

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
