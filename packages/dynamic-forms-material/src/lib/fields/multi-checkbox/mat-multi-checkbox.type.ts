import { DynamicText } from '@ng-forge/dynamic-forms';
import { MultiCheckboxField } from '@ng-forge/dynamic-forms/integration';
import { ThemePalette } from '@angular/material/core';

export interface MatMultiCheckboxProps {
  disableRipple?: boolean;
  hint?: DynamicText;
  labelPosition?: 'before' | 'after';
  color?: ThemePalette;
}

export type MatMultiCheckboxField<T> = MultiCheckboxField<T, MatMultiCheckboxProps>;
