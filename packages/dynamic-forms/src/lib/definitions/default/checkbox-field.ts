import { BaseCheckedField } from '../base/base-checked-field';

export interface CheckboxField<TProps> extends BaseCheckedField<TProps> {
  type: 'checkbox';
}
