import { DynamicText, MultiCheckboxField, ValueFieldComponent } from '@ng-forge/dynamic-form';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface PrimeMultiCheckboxProps<T> extends Record<string, unknown> {
  /**
   * CSS class to apply to the checkbox group.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the checkbox group.
   */
  hint?: DynamicText;
}

export type PrimeMultiCheckboxField<T> = MultiCheckboxField<T, PrimeMultiCheckboxProps<T>>;

export type PrimeMultiCheckboxComponent<T> = ValueFieldComponent<PrimeMultiCheckboxField<T>>;
