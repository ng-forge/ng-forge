import { InputField, ValueFieldComponent } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

export interface MatInputProps extends Record<string, unknown> {
  appearance?: MatFormFieldAppearance;
  disableRipple?: boolean;
  subscriptSizing?: SubscriptSizing;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  hint?: string;
}

export type MatInputField = InputField<MatInputProps>;

export type MatInputComponent = ValueFieldComponent<MatInputField>;
