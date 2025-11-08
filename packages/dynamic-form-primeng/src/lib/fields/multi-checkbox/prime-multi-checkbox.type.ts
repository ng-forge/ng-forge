import { DynamicText, MultiCheckboxField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface PrimeMultiCheckboxProps {
  /**
   * CSS class to apply to the checkbox group.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the checkbox group.
   */
  hint?: DynamicText;
}

export type PrimeMultiCheckboxField<T> = MultiCheckboxField<T, PrimeMultiCheckboxProps>;

export type PrimeMultiCheckboxComponent<T> = ValueFieldComponent<PrimeMultiCheckboxField<T>>;
