import { RadioField, ValueControlFieldType } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatRadioProps<T> extends RadioField<T> {
  appearance?: MatFormFieldAppearance;
  disableRipple?: boolean;
  tabIndex?: number;
}

export type MatRadioField<T> = ValueControlFieldType<MatRadioProps<T>, T>;
