import { BaseValueField } from '@ng-forge/dynamic-forms';

/**
 * Base props for datepicker fields. Intentionally empty — adapter libraries
 * extend this with adapter-specific options (startView, appearance, hint, etc.).
 */
export type DatepickerProps = object;

export interface DatepickerField<TProps> extends BaseValueField<TProps, Date | string> {
  type: 'datepicker';
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  startAt?: Date | null;
}
