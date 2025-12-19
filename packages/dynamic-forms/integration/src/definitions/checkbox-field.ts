import { BaseCheckedField } from '@ng-forge/dynamic-forms';

export interface CheckboxField<TProps> extends BaseCheckedField<TProps> {
  type: 'checkbox';
}
