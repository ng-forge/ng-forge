import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { InputField, InputProps } from '@ng-forge/dynamic-forms/integration';
import { FloatLabelType, MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

export interface MatInputProps extends InputProps {
  appearance?: MatFormFieldAppearance;
  disableRipple?: boolean;
  subscriptSizing?: SubscriptSizing;
  floatLabel?: FloatLabelType;
  hideRequiredMarker?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  hint?: DynamicText;
}

export type MatInputField = InputField<MatInputProps>;

export type MatInputComponent = ValueFieldComponent<MatInputField>;
