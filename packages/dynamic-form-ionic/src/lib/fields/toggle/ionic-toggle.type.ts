import { ToggleField, CheckedFieldComponent } from '@ng-forge/dynamic-form';

export interface IonicToggleProps {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  enableOnOffLabels?: boolean;
}

export type IonicToggleField = ToggleField<IonicToggleProps>;

export type IonicToggleComponent = CheckedFieldComponent<IonicToggleField>;
