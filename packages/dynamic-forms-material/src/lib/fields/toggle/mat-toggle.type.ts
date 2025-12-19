import { CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-forms';
import { ToggleField } from '@ng-forge/dynamic-forms/integration';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { ThemePalette } from '@angular/material/core';

export interface MatToggleProps {
  hint?: DynamicText;
  appearance?: MatFormFieldAppearance;
  color?: ThemePalette;
  labelPosition?: 'before' | 'after';
  disableRipple?: boolean;
  hideIcon?: boolean;
}

export type MatToggleField = ToggleField<MatToggleProps>;

export type MatToggleComponent = CheckedFieldComponent<MatToggleField>;
