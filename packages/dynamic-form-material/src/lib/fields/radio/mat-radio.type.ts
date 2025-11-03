import { DynamicText, RadioField, ValueFieldComponent } from '@ng-forge/dynamic-form';
import { ThemePalette } from '@angular/material/core';

export interface MatRadioProps extends Record<string, unknown> {
  disableRipple?: boolean;
  color?: ThemePalette;
  labelPosition?: 'before' | 'after';
  hint?: DynamicText;
}

export type MatRadioField<T> = RadioField<T, MatRadioProps>;

export type MatRadioComponent<T> = ValueFieldComponent<MatRadioField<T>>;
