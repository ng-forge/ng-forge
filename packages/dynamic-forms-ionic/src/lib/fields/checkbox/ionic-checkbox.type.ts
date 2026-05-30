import { DynamicText } from '@ng-forge/dynamic-forms';
import { CheckedFieldComponent } from '@ng-forge/dynamic-forms/integration';
import { CheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface IonicCheckboxProps {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  indeterminate?: boolean;
  hint?: DynamicText;
}

export type IonicCheckboxField = CheckboxField<IonicCheckboxProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type IonicCheckboxComponent = CheckedFieldComponent<IonicCheckboxField>;
