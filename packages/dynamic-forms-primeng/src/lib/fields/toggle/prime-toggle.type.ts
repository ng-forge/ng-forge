import { CheckedFieldComponent, DynamicText, ToggleField } from '@ng-forge/dynamic-forms';

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
