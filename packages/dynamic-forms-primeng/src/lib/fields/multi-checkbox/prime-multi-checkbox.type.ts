import { DynamicText, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-forms';
import { MultiCheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface PrimeMultiCheckboxProps {
  /** CSS class to apply to the checkbox group. */
  styleClass?: string;
  /** Hint text displayed below the checkbox group. */
  hint?: DynamicText;
}

export type PrimeMultiCheckboxField<T> = MultiCheckboxField<T, PrimeMultiCheckboxProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type PrimeMultiCheckboxComponent = ValueFieldComponent<PrimeMultiCheckboxField<ValueType>>;
