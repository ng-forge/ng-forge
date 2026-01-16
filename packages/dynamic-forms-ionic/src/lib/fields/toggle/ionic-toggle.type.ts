import { CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-forms';
import { ToggleField } from '@ng-forge/dynamic-forms/integration';

export interface IonicToggleProps {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  enableOnOffLabels?: boolean;
  hint?: DynamicText;
}

export type IonicToggleField = ToggleField<IonicToggleProps>;

export type IonicToggleComponent = CheckedFieldComponent<IonicToggleField>;
