import { CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-forms';
import { ToggleField } from '@ng-forge/dynamic-forms/integration';

export interface PrimeToggleProps {
  /**
   * CSS class to apply to the toggle element.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the toggle.
   */
  hint?: DynamicText;
}

export type PrimeToggleField = ToggleField<PrimeToggleProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type PrimeToggleComponent = CheckedFieldComponent<PrimeToggleField>;
