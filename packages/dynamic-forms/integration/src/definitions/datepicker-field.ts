import { BaseValueField, DynamicText, FieldMeta } from '@ng-forge/dynamic-forms';

export interface DatepickerProps {
  placeholder?: DynamicText;
}

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
