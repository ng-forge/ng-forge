import { DynamicText, InputField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface PrimeInputProps extends Record<string, unknown> {
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
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
}

export type PrimeInputField = InputField<PrimeInputProps>;

export type PrimeInputComponent = ValueFieldComponent<PrimeInputField>;
