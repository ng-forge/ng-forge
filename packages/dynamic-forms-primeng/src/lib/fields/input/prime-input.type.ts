import { DynamicText, InputFieldDef, InputProps, ValueFieldComponent } from '@ng-forge/dynamic-forms';

export interface PrimeInputProps extends InputProps {
  /**
   * CSS class to apply to the input element.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the input.
   */
  hint?: DynamicText;
  /**
   * Size variant of the input.
   */
  size?: 'small' | 'large';
  /**
   * Visual variant of the input.
   */
  variant?: 'outlined' | 'filled';
  /**
   * Type of the input element.
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export type PrimeInputField = InputFieldDef<PrimeInputProps>;

export type PrimeInputComponent = ValueFieldComponent<PrimeInputField>;
