import { DynamicText, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-forms';
import { SelectField, SelectProps } from '@ng-forge/dynamic-forms/integration';

/**
 * Configuration props for PrimeNG select field component.
 */
export interface PrimeSelectProps extends SelectProps {
  /**
   * Enable multiple selection mode.
   */
  multiple?: boolean;
  /**
   * Enable filtering/search functionality.
   */
  filter?: boolean;
  /**
   * Placeholder text when no option is selected.
   */
  placeholder?: DynamicText;
  /**
   * Show clear button to deselect value.
   */
  showClear?: boolean;
  /**
   * CSS class to apply to the dropdown element.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the select.
   */
  hint?: DynamicText;
  /**
   * Custom comparison function for determining equality of option values.
   */
  compareWith?: (o1: ValueType, o2: ValueType) => boolean;
}

export type PrimeSelectField<T> = SelectField<T, PrimeSelectProps>;

export type PrimeSelectComponent = ValueFieldComponent<PrimeSelectField<ValueType>>;
