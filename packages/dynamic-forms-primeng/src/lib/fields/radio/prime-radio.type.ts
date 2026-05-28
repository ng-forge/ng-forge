import { DynamicText, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-forms';
import { RadioField } from '@ng-forge/dynamic-forms/integration';

export interface PrimeRadioProps {
  /** Name of the radio button group. */
  name?: string;
  /** CSS class to apply to the radio button. */
  styleClass?: string;
  /** Hint text displayed below the radio group. */
  hint?: DynamicText;
}

export type PrimeRadioField<T> = RadioField<T, PrimeRadioProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type PrimeRadioComponent = ValueFieldComponent<PrimeRadioField<ValueType>>;
