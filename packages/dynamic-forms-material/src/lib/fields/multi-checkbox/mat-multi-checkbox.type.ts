import { DynamicText, ValueType } from '@ng-forge/dynamic-forms';
import { ValueFieldComponent } from '@ng-forge/dynamic-forms/integration';
import { MultiCheckboxField } from '@ng-forge/dynamic-forms/integration';
import { ThemePalette } from '@angular/material/core';

export interface MatMultiCheckboxProps {
  disableRipple?: boolean;
  hint?: DynamicText;
  labelPosition?: 'before' | 'after';
  color?: ThemePalette;
}

export type MatMultiCheckboxField<T> = MultiCheckboxField<T, MatMultiCheckboxProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type MatMultiCheckboxComponent = ValueFieldComponent<MatMultiCheckboxField<ValueType>>;
