import { MultiCheckboxField, ValueFieldComponent } from '@ng-forge/dynamic-form';
import { ThemePalette } from '@angular/material/core';

export interface MatMultiCheckboxProps extends Record<string, unknown> {
  disableRipple?: boolean;
  tabIndex?: number;
  hint?: string;
  labelPosition?: 'before' | 'after';
  color?: ThemePalette;
}

export type MatMultiCheckboxField<T> = MultiCheckboxField<T, MatMultiCheckboxProps>;

export type MatMultiCheckboxComponent<T> = ValueFieldComponent<MatMultiCheckboxField<T>>;
