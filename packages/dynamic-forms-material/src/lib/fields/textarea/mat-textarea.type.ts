import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { TextareaField, TextareaProps } from '@ng-forge/dynamic-forms/integration';
import { FloatLabelType, MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

export interface MatTextareaProps extends TextareaProps {
  hint?: DynamicText;
  appearance?: MatFormFieldAppearance;
  subscriptSizing?: SubscriptSizing;
  floatLabel?: FloatLabelType;
  hideRequiredMarker?: boolean;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export type MatTextareaField = TextareaField<MatTextareaProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type MatTextareaComponent = ValueFieldComponent<MatTextareaField>;
