import { CheckedFieldComponent, DynamicText, ToggleField } from '@ng-forge/dynamic-form';

export interface PrimeToggleProps {
  /**
   * CSS class to apply to the toggle element.
   */
  styleClass?: string;
  /**
   * Value to use when toggled on.
   */
  trueValue?: unknown;
  /**
   * Value to use when toggled off.
   */
  falseValue?: unknown;
  /**
   * Hint text displayed below the toggle.
   */
  hint?: DynamicText;
}

export type PrimeToggleField = ToggleField<PrimeToggleProps>;

export type PrimeToggleComponent = CheckedFieldComponent<PrimeToggleField>;
