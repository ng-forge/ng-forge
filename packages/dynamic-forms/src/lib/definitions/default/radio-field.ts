import { BaseValueField } from '../base/base-value-field';
import { FieldOption } from '../../models/field-option';

export interface RadioField<T, TProps> extends BaseValueField<TProps, T> {
  type: 'radio';
  options: FieldOption<T>[];
}
