import { DynamicText, InputField, InputProps, ValueFieldComponent, HintFieldProps } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

export interface MatInputProps extends InputProps, HintFieldProps {
  appearance?: MatFormFieldAppearance;
  disableRipple?: boolean;
  subscriptSizing?: SubscriptSizing;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export type MatInputField = InputField<MatInputProps>;

export type MatInputComponent = ValueFieldComponent<MatInputField>;
