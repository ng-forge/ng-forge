import { BaseValueField, DynamicText, FieldOption } from '@ng-forge/dynamic-forms';

export interface SelectProps {
  placeholder?: DynamicText;
}

export interface SelectField<T, TProps = SelectProps> extends BaseValueField<TProps, T> {
  type: 'select';
  readonly options: readonly FieldOption<T>[];
}
