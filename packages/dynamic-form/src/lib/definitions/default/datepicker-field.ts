import { BaseValueField } from '../base';

export interface DatepickerField<TProps extends Record<string, unknown>> extends BaseValueField<TProps, Date | string> {
  type: 'date';

  valueType: 'date';

  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  startAt?: Date | null;
}
