import { CheckboxField, CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-forms';
import { ThemePalette } from '@angular/material/core';

export interface MatCheckboxProps {
  color?: ThemePalette;
  disableRipple?: boolean;
  labelPosition?: 'before' | 'after';
  hint?: DynamicText;
  indeterminate?: boolean;
}

export type MatCheckboxField = CheckboxField<MatCheckboxProps>;

export type MatCheckboxComponent = CheckedFieldComponent<MatCheckboxField>;
