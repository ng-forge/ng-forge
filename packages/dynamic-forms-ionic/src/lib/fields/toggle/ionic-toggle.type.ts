import { CheckedFieldComponent, ToggleField } from '@ng-forge/dynamic-forms';

export interface IonicToggleProps {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  enableOnOffLabels?: boolean;
}

export type IonicToggleField = ToggleField<IonicToggleProps>;

export type IonicToggleComponent = CheckedFieldComponent<IonicToggleField>;
