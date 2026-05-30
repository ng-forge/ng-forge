import { DynamicText } from '@ng-forge/dynamic-forms';
import { CheckedFieldComponent } from '@ng-forge/dynamic-forms/integration';
import { ToggleField } from '@ng-forge/dynamic-forms/integration';

export interface IonicToggleProps {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  enableOnOffLabels?: boolean;
  hint?: DynamicText;
}

export type IonicToggleField = ToggleField<IonicToggleProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type IonicToggleComponent = CheckedFieldComponent<IonicToggleField>;
