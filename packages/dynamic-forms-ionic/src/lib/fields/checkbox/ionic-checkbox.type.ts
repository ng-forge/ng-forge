import { CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-forms';
import { CheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface IonicCheckboxProps {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  indeterminate?: boolean;
  hint?: DynamicText;
}

export type IonicCheckboxField = CheckboxField<IonicCheckboxProps>;

export type IonicCheckboxComponent = CheckedFieldComponent<IonicCheckboxField>;
