import { BaseValueField, FieldMeta } from '@ng-forge/dynamic-forms/internal';

/**
 * Base props for datepicker fields. Intentionally empty — adapter libraries
 * extend this with adapter-specific options (startView, appearance, hint, etc.).
 */
export type DatepickerProps = object;

export interface DatepickerField<TProps, TNullable extends boolean = boolean> extends BaseValueField<
  TProps,
  // A date, or several from kits with multiple or range selection (PrimeNG, Ionic).
  Date | string | readonly (Date | string)[],
  FieldMeta,
  TNullable
> {
  type: 'datepicker';
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  startAt?: Date | null;
}
