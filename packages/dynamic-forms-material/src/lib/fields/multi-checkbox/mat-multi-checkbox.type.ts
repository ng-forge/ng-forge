import { DynamicText, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-forms';
import { MultiCheckboxField } from '@ng-forge/dynamic-forms/integration';
import { ThemePalette } from '@angular/material/core';

export interface MatMultiCheckboxProps {
  disableRipple?: boolean;
  tabIndex?: number;
  hint?: DynamicText;
  labelPosition?: 'before' | 'after';
  color?: ThemePalette;
}

export type MatMultiCheckboxField<T> = MultiCheckboxField<T, MatMultiCheckboxProps>;

export type MatMultiCheckboxComponent = ValueFieldComponent<MatMultiCheckboxField<ValueType>>;
