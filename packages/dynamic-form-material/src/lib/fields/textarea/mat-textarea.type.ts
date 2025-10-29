import { TextareaField, ValueFieldComponent } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

export interface MatTextareaProps extends Record<string, unknown> {
  hint?: string;
  appearance: MatFormFieldAppearance;
  subscriptSizing?: SubscriptSizing;
}

export type MatTextareaField = TextareaField<MatTextareaProps>;

export type MatTextareaComponent = ValueFieldComponent<MatTextareaField>;
