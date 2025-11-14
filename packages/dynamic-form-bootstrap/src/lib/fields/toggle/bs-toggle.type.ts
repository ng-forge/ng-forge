import { ToggleField, CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-form';

export interface BsToggleProps {
  size?: 'sm' | 'lg';
  reverse?: boolean;
  inline?: boolean;
  helpText?: DynamicText;
}

export type BsToggleField = ToggleField<BsToggleProps>;

export type BsToggleComponent = CheckedFieldComponent<BsToggleField>;
