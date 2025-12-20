import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { TextareaField, TextareaProps } from '@ng-forge/dynamic-forms/integration';
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
