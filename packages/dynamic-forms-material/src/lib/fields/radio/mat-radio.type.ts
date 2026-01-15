import { DynamicText, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-forms';
import { RadioField } from '@ng-forge/dynamic-forms/integration';
import { ThemePalette } from '@angular/material/core';

export interface MatRadioProps {
  disableRipple?: boolean;
  color?: ThemePalette;
  labelPosition?: 'before' | 'after';
  hint?: DynamicText;
}

export type MatRadioField<T> = RadioField<T, MatRadioProps>;

export type MatRadioComponent = ValueFieldComponent<MatRadioField<ValueType>>;
