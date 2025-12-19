import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { InputField, InputProps } from '@ng-forge/dynamic-forms/integration';
import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

export interface MatInputProps extends InputProps {
  appearance?: MatFormFieldAppearance;
  disableRipple?: boolean;
  subscriptSizing?: SubscriptSizing;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  hint?: DynamicText;
}

export type MatInputField = InputField<MatInputProps>;

export type MatInputComponent = ValueFieldComponent<MatInputField>;
