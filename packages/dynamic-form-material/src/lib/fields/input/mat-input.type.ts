import { FieldType, InputField } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatInputProps extends InputField {
  appearance?: MatFormFieldAppearance;
}

export type MatInputField = FieldType<MatInputProps>;
