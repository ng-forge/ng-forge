import { CheckedFieldComponent, ToggleField } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { ThemePalette } from '@angular/material/core';

export interface MatToggleProps extends Record<string, unknown> {
  hint?: string;
  appearance?: MatFormFieldAppearance;
  color?: ThemePalette;
  labelPosition?: 'before' | 'after';
  disableRipple?: boolean;
}

export type MatToggleField = ToggleField<MatToggleProps>;

export type MatToggleComponent = CheckedFieldComponent<MatToggleField>;
