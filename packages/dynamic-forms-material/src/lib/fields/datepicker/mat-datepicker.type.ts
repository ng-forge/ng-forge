import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { DatepickerField, DatepickerProps } from '@ng-forge/dynamic-forms/integration';
import { FloatLabelType, MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

export interface MatDatepickerProps extends DatepickerProps {
  appearance?: MatFormFieldAppearance;
  color?: 'primary' | 'accent' | 'warn';
  disableRipple?: boolean;
  subscriptSizing?: SubscriptSizing;
  floatLabel?: FloatLabelType;
  hideRequiredMarker?: boolean;
  startView?: 'month' | 'year' | 'multi-year';
  touchUi?: boolean;
  hint?: DynamicText;
}

export type MatDatepickerField = DatepickerField<MatDatepickerProps>;

export type MatDatepickerComponent = ValueFieldComponent<MatDatepickerField>;
