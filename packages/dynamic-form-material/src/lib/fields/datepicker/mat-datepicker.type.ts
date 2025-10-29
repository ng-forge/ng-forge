import { DatepickerField, ValueFieldComponent } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

export interface MatDatepickerProps extends Record<string, unknown> {
  appearance?: MatFormFieldAppearance;
  color?: 'primary' | 'accent' | 'warn';
  disableRipple?: boolean;
  subscriptSizing?: SubscriptSizing;
  startView?: 'month' | 'year' | 'multi-year';
  touchUi?: boolean;
  hint?: string;
}

export type MatDatepickerField = DatepickerField<MatDatepickerProps>;

export type MatDatepickerComponent = ValueFieldComponent<MatDatepickerField>;


