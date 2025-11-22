import { DynamicText, InputFieldDef, InputProps, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

export interface MatInputProps extends InputProps {
  appearance?: MatFormFieldAppearance;
  disableRipple?: boolean;
  subscriptSizing?: SubscriptSizing;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  hint?: DynamicText;
}

export type MatInputField = InputFieldDef<MatInputProps>;

export type MatInputComponent = ValueFieldComponent<MatInputField>;
