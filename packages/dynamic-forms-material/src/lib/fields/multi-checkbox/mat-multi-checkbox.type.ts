import { DynamicText, MultiCheckboxField, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { ThemePalette } from '@angular/material/core';

export interface MatMultiCheckboxProps {
  disableRipple?: boolean;
  tabIndex?: number;
  hint?: DynamicText;
  labelPosition?: 'before' | 'after';
  color?: ThemePalette;
}

export type MatMultiCheckboxField<T> = MultiCheckboxField<T, MatMultiCheckboxProps>;

export type MatMultiCheckboxComponent<T> = ValueFieldComponent<MatMultiCheckboxField<T>>;
