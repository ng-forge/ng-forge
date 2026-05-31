import { DynamicText } from '@ng-forge/dynamic-forms';
import { CheckedFieldComponent } from '@ng-forge/dynamic-forms/integration';
import { ToggleField } from '@ng-forge/dynamic-forms/integration';

export interface BsToggleProps {
  size?: 'sm' | 'lg';
  reverse?: boolean;
  inline?: boolean;
  hint?: DynamicText;
}

export type BsToggleField = ToggleField<BsToggleProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type BsToggleComponent = CheckedFieldComponent<BsToggleField>;
