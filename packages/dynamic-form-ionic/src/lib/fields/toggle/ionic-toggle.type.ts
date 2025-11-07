import { CheckboxField, CheckedFieldComponent } from '@ng-forge/dynamic-form';

export interface IonicToggleProps extends Record<string, unknown> {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  enableOnOffLabels?: boolean;
}

export type IonicToggleField = CheckboxField<IonicToggleProps>;

export type IonicToggleComponent = CheckedFieldComponent<IonicToggleField>;
