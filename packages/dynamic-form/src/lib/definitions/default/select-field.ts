import { BaseValueField } from '../base';
import { FieldOption } from '../../models/field-option';
import { DynamicText } from '../../models';

export interface SelectProps {
  placeholder?: DynamicText;
}

/**
 * Interface for select field fields
 */
export interface SelectField<T, TProps = SelectProps> extends BaseValueField<TProps, T> {
  options: FieldOption<T>[];
}
