import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import { DynamicText, SelectField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface MatSelectProps<T> {
  appearance?: MatFormFieldAppearance;
  multiple?: boolean;
  panelMaxHeight?: string;
  subscriptSizing?: SubscriptSizing;
  compareWith?: (o1: T, o2: T) => boolean;
  hint?: DynamicText;
}

export type MatSelectField<T> = SelectField<T, MatSelectProps<T>>;

export type MatSelectComponent<T> = ValueFieldComponent<MatSelectField<T>>;
