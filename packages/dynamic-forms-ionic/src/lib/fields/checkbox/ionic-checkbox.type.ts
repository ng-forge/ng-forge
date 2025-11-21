import { CheckboxField, CheckedFieldComponent } from '@ng-forge/dynamic-forms';

export interface IonicCheckboxProps {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  indeterminate?: boolean;
}

export type IonicCheckboxField = CheckboxField<IonicCheckboxProps>;

export type IonicCheckboxComponent = CheckedFieldComponent<IonicCheckboxField>;
