import { CheckboxField, CheckedFieldComponent } from '@ng-forge/dynamic-form';
import { ThemePalette } from '@angular/material/core';

export interface MatCheckboxProps extends Record<string, unknown> {
  color?: ThemePalette;
  disableRipple?: boolean;
  labelPosition?: 'before' | 'after';
  hint?: string;
  indeterminate?: boolean;
}

export type MatCheckboxField = CheckboxField<MatCheckboxProps>;

export type MatCheckboxComponent = CheckedFieldComponent<MatCheckboxField>;
