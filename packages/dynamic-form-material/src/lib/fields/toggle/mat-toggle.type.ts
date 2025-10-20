import { ToggleField, ValueControlFieldType } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatToggleProps extends ToggleField {
  disableRipple?: boolean;
  tabIndex?: number;
  appearance: MatFormFieldAppearance;
}

export type MatToggleField = ValueControlFieldType<MatToggleProps, boolean>;
