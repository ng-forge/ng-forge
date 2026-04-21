import { BaseValueField, FieldMeta } from '@ng-forge/dynamic-forms';

/**
 * Base props for datepicker fields. Intentionally empty — adapter libraries
 * extend this with adapter-specific options (startView, appearance, hint, etc.).
 */
export type DatepickerProps = object;

export interface DatepickerField<TProps, TNullable extends boolean = boolean> extends BaseValueField<
  TProps,
  Date | string,
  FieldMeta,
  TNullable
> {
  type: 'datepicker';
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  startAt?: Date | null;
}
