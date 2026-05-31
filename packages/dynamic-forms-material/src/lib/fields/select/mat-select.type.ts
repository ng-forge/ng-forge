import { FloatLabelType, MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import { DynamicText, ValueType } from '@ng-forge/dynamic-forms';
import { ValueFieldComponent } from '@ng-forge/dynamic-forms/integration';
import { SelectField, SelectProps } from '@ng-forge/dynamic-forms/integration';

export interface MatSelectProps extends SelectProps {
  appearance?: MatFormFieldAppearance;
  multiple?: boolean;
  panelMaxHeight?: string;
  subscriptSizing?: SubscriptSizing;
  floatLabel?: FloatLabelType;
  hideRequiredMarker?: boolean;
  compareWith?: (o1: ValueType, o2: ValueType) => boolean;
  hint?: DynamicText;
}

export type MatSelectField<T> = SelectField<T, MatSelectProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type MatSelectComponent = ValueFieldComponent<MatSelectField<ValueType>>;
