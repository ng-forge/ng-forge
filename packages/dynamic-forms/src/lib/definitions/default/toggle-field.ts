import { BaseCheckedField } from '../base/base-checked-field';

export interface ToggleField<TProps> extends BaseCheckedField<TProps> {
  type: 'toggle';
}
