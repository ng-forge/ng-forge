import { DynamicText, SelectField, SelectProps, ValueFieldComponent } from '@ng-forge/dynamic-form';

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
   * Size variant of the select.
   */
  size?: 'small' | 'large';
  /**
   * Visual variant of the select.
   */
  variant?: 'outlined' | 'filled';
}

export type PrimeSelectField<T> = SelectField<T, PrimeSelectProps>;

export type PrimeSelectComponent<T> = ValueFieldComponent<PrimeSelectField<T>>;
