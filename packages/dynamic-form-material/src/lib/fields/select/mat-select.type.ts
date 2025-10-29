import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import { SelectField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface MatSelectProps<T> extends Record<string, unknown> {
  appearance?: MatFormFieldAppearance;
  multiple?: boolean;
  panelMaxHeight?: string;
  subscriptSizing?: SubscriptSizing;
  compareWith?: (o1: T, o2: T) => boolean;
  hint?: string;
}

export type MatSelectField<T> = SelectField<T, MatSelectProps<T>>;

export type MatSelectComponent<T> = ValueFieldComponent<MatSelectField<T>>;
