import { CheckboxField, CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-form';

export interface BsToggleProps extends Record<string, unknown> {
  size?: 'sm' | 'lg';
  reverse?: boolean;
  inline?: boolean;
  helpText?: DynamicText;
}

export type BsToggleField = CheckboxField<BsToggleProps>;

export type BsToggleComponent = CheckedFieldComponent<BsToggleField>;
