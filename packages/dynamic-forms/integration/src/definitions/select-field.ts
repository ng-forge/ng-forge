import { BaseValueField, DynamicText, FieldMeta, FieldOption } from '@ng-forge/dynamic-forms';

export interface SelectProps {
  placeholder?: DynamicText;
}

export interface SelectField<T, TProps = SelectProps, TNullable extends boolean = false> extends BaseValueField<
  TProps,
  T,
  FieldMeta,
  TNullable
> {
  type: 'select';
  readonly options: readonly FieldOption<T>[];
}
