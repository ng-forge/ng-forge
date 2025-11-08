import { DynamicText, TextareaField, TextareaProps, ValueFieldComponent } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

export interface MatTextareaProps extends TextareaProps {
  hint?: DynamicText;
  appearance?: MatFormFieldAppearance;
  subscriptSizing?: SubscriptSizing;
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  maxLength?: number;
}

export type MatTextareaField = TextareaField<MatTextareaProps>;

export type MatTextareaComponent = ValueFieldComponent<MatTextareaField>;
