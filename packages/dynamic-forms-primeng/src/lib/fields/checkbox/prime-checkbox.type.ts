import { CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-forms';
import { CheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface PrimeCheckboxProps {
  /**
   * Binary mode for boolean values.
   */
  binary?: boolean;
  /**
   * CSS class to apply to the checkbox element.
   */
  styleClass?: string;
  /**
   * Value to use when checked.
   */
  trueValue?: unknown;
  /**
   * Value to use when unchecked.
   */
  falseValue?: unknown;
  /**
   * Hint text displayed below the checkbox.
   */
  hint?: DynamicText;
}

export type PrimeCheckboxField = CheckboxField<PrimeCheckboxProps>;

export type PrimeCheckboxComponent = CheckedFieldComponent<PrimeCheckboxField>;
