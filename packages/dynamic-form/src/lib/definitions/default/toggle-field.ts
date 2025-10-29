import { BaseCheckedField } from '../base';

export interface ToggleField<TProps extends Record<string, unknown>> extends BaseCheckedField<TProps> {
  type: 'toggle';
}
