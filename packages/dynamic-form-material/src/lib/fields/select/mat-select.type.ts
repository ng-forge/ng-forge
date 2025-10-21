import { SelectField, ValueControlFieldType } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatSelectProps<T> extends SelectField<T> {
  appearance: MatFormFieldAppearance;
}

export type MatSelectField<T> = ValueControlFieldType<MatSelectProps<T>, T>;
