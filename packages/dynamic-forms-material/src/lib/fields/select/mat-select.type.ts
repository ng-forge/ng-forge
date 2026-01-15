import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import { DynamicText, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-forms';
import { SelectField, SelectProps } from '@ng-forge/dynamic-forms/integration';

export interface MatSelectProps extends SelectProps {
  appearance?: MatFormFieldAppearance;
  multiple?: boolean;
  panelMaxHeight?: string;
  subscriptSizing?: SubscriptSizing;
  compareWith?: (o1: ValueType, o2: ValueType) => boolean;
  hint?: DynamicText;
}

export type MatSelectField<T> = SelectField<T, MatSelectProps>;

export type MatSelectComponent = ValueFieldComponent<MatSelectField<ValueType>>;
