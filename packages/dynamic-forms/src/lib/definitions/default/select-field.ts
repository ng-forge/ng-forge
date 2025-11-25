import { BaseValueField } from '../base';
import { FieldOption } from '../../models/field-option';
import { DynamicText } from '../../models';

export interface SelectProps {
  placeholder?: DynamicText;
}

export interface SelectField<T, TProps = SelectProps> extends BaseValueField<TProps, T> {
  type: 'select';
  readonly options: readonly FieldOption<T>[];
}
