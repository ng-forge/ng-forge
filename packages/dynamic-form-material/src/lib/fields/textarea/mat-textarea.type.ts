import { TextareaField } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatTextareaProps extends TextareaField {
  appearance: MatFormFieldAppearance;
}

// export type MatTextareaField = FieldType<MatTextareaProps>;
