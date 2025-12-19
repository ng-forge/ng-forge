import { BaseCheckedField } from '@ng-forge/dynamic-forms';

export interface ToggleField<TProps> extends BaseCheckedField<TProps> {
  type: 'toggle';
}
