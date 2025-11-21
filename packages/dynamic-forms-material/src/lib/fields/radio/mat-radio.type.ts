import { DynamicText, RadioField, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { ThemePalette } from '@angular/material/core';

export interface MatRadioProps {
  disableRipple?: boolean;
  color?: ThemePalette;
  labelPosition?: 'before' | 'after';
  hint?: DynamicText;
}

export type MatRadioField<T> = RadioField<T, MatRadioProps>;

export type MatRadioComponent<T> = ValueFieldComponent<MatRadioField<T>>;
