import { BaseCheckedField } from '../base';

export interface ToggleField<TProps> extends BaseCheckedField<TProps> {
  type: 'toggle';
}
