import { MultiCheckboxField, ValueControlFieldType } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatMultiCheckboxProps<T = unknown> extends MultiCheckboxField<T> {
  appearance?: MatFormFieldAppearance;
  disableRipple?: boolean;
  tabIndex?: number;
}

export type MatMultiCheckboxField<T = unknown> = ValueControlFieldType<MatMultiCheckboxProps<T>, T[]>;
