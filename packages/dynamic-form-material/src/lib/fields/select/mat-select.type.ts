import { SelectField, ValueControlFieldType } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatSelectProps extends SelectField {
  appearance: MatFormFieldAppearance;
}

export type MatSelectField<T = unknown> = ValueControlFieldType<MatSelectProps, T>;
