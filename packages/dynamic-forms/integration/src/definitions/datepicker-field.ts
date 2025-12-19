import { BaseValueField, DynamicText } from '@ng-forge/dynamic-forms';

export interface DatepickerProps {
  placeholder?: DynamicText;
}

export interface DatepickerField<TProps> extends BaseValueField<TProps, Date | string> {
  type: 'datepicker';
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  startAt?: Date | null;
}
