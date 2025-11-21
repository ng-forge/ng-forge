import { CheckedFieldComponent, DynamicText, ToggleField } from '@ng-forge/dynamic-forms';

export interface BsToggleProps {
  size?: 'sm' | 'lg';
  reverse?: boolean;
  inline?: boolean;
  helpText?: DynamicText;
}

export type BsToggleField = ToggleField<BsToggleProps>;

export type BsToggleComponent = CheckedFieldComponent<BsToggleField>;
