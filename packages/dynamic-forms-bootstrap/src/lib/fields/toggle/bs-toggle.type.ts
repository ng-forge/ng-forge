import { CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-forms';
import { ToggleField } from '@ng-forge/dynamic-forms/integration';

export interface BsToggleProps {
  size?: 'sm' | 'lg';
  reverse?: boolean;
  inline?: boolean;
  hint?: DynamicText;
}

export type BsToggleField = ToggleField<BsToggleProps>;

export type BsToggleComponent = CheckedFieldComponent<BsToggleField>;
