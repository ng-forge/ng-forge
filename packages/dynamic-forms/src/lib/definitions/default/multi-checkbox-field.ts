import { BaseValueField } from '../base';
import { FieldOption } from '../../models/field-option';

export interface MultiCheckboxField<TValue, TProps> extends BaseValueField<TProps, TValue> {
  type: 'multi-checkbox';
  options: FieldOption<TValue>[];
}
