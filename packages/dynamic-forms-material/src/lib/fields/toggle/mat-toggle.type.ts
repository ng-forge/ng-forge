import { DynamicText } from '@ng-forge/dynamic-forms';
import { ToggleField } from '@ng-forge/dynamic-forms/integration';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { ThemePalette } from '@angular/material/core';

export interface MatToggleProps {
  hint?: DynamicText;
  /** @deprecated Has no effect: this Material control has no form-field appearance. It will be removed in 2.0. */
  appearance?: MatFormFieldAppearance;
  color?: ThemePalette;
  labelPosition?: 'before' | 'after';
  disableRipple?: boolean;
  hideIcon?: boolean;
}

export type MatToggleField = ToggleField<MatToggleProps>;
