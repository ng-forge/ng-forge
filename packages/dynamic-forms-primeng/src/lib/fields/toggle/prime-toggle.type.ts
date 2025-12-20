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

export type PrimeToggleComponent = CheckedFieldComponent<PrimeToggleField>;
