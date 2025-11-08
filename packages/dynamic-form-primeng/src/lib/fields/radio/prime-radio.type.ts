import { DynamicText, RadioField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface PrimeRadioProps {
  /**
   * Name of the radio button group.
   */
  name?: string;
  /**
   * CSS class to apply to the radio button.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the radio group.
   */
  hint?: DynamicText;
}

export type PrimeRadioField<T> = RadioField<T, PrimeRadioProps>;

export type PrimeRadioComponent<T> = ValueFieldComponent<PrimeRadioField<T>>;
