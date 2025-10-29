import { BaseCheckedField } from '../base';

export interface CheckboxField<TProps extends Record<string, unknown>> extends BaseCheckedField<TProps> {
  type: 'checkbox';
}
