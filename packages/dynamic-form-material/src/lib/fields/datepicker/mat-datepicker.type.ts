import { DatepickerField } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatDatepickerProps extends DatepickerField {
  appearance?: MatFormFieldAppearance;
  color?: 'primary' | 'accent' | 'warn';
  disableRipple?: boolean;
  tabIndex?: number;
}

// export type MatDatepickerField = ValueControlFieldType<MatDatepickerProps, Date | null>;
