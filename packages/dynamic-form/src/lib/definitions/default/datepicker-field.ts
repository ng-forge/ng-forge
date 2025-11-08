import { BaseValueField } from '../base';

export interface DatepickerField<TProps> extends BaseValueField<TProps, Date | string> {
  type: 'date';

  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  startAt?: Date | null;
}
