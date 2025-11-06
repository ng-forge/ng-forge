import type {
  ButtonField,
  CheckboxField,
  DynamicText,
  FieldOption,
  InputField,
  SelectField,
  TextareaField,
  RadioField,
  MultiCheckboxField,
  DatepickerField,
  SliderField,
  FormEvent,
} from '@ng-forge/dynamic-form';
import type { PrimeField } from './types';

// ============================================
// INPUT FIELD
// ============================================

/**
 * Configuration props for PrimeNG input field component.
 */
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

/**
 * PrimeNG input field type definition.
 */
export type PrimeInputField = InputField<PrimeInputProps>;

// ============================================
// SELECT FIELD
// ============================================

/**
 * Configuration props for PrimeNG select field component.
 */
export interface PrimeSelectProps<T> extends Record<string, unknown> {
  /**
   * Array of options to display in the dropdown.
   */
  options: FieldOption<T>[];
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
}

/**
 * PrimeNG select field type definition.
 */
export type PrimeSelectField<T> = SelectField<T, PrimeSelectProps<T>>;

// ============================================
// CHECKBOX FIELD
// ============================================

/**
 * Configuration props for PrimeNG checkbox field component.
 */
export interface PrimeCheckboxProps extends Record<string, unknown> {
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

/**
 * PrimeNG checkbox field type definition.
 */
export type PrimeCheckboxField = CheckboxField<PrimeCheckboxProps>;

// ============================================
// BUTTON FIELDS
// ============================================

/**
 * Configuration props for PrimeNG button field component.
 */
export interface PrimeButtonProps extends Record<string, unknown> {
  /**
   * Severity/color variant of the button.
   */
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
  /**
   * Text-only button style.
   */
  text?: boolean;
  /**
   * Outlined button style.
   */
  outlined?: boolean;
  /**
   * Raised button style with shadow.
   */
  raised?: boolean;
  /**
   * Rounded button style.
   */
  rounded?: boolean;
  /**
   * Icon to display in the button.
   */
  icon?: string;
  /**
   * Position of the icon relative to the label.
   */
  iconPos?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * PrimeNG button field type definition.
 */
export type PrimeButtonField<T extends FormEvent = FormEvent> = ButtonField<PrimeButtonProps, T>;

/**
 * PrimeNG submit button field type definition.
 */
export type PrimeSubmitButtonField = PrimeButtonField<FormEvent>;

/**
 * PrimeNG next button field type definition.
 */
export type PrimeNextButtonField = PrimeButtonField<FormEvent>;

/**
 * PrimeNG previous button field type definition.
 */
export type PrimePreviousButtonField = PrimeButtonField<FormEvent>;

// ============================================
// TEXTAREA FIELD
// ============================================

/**
 * Configuration props for PrimeNG textarea field component.
 */
export interface PrimeTextareaProps extends Record<string, unknown> {
  /**
   * Number of visible text lines.
   */
  rows?: number;
  /**
   * Enable automatic resizing based on content.
   */
  autoResize?: boolean;
  /**
   * Maximum number of characters allowed.
   */
  maxlength?: number;
  /**
   * CSS class to apply to the textarea element.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the textarea.
   */
  hint?: DynamicText;
}

/**
 * PrimeNG textarea field type definition.
 */
export type PrimeTextareaField = TextareaField<PrimeTextareaProps>;

// ============================================
// RADIO FIELD
// ============================================

/**
 * Configuration props for PrimeNG radio field component.
 */
export interface PrimeRadioProps<T> extends Record<string, unknown> {
  /**
   * Array of options to display as radio buttons.
   */
  options: FieldOption<T>[];
  /**
   * CSS class to apply to the radio group.
   */
  styleClass?: string;
  /**
   * Name attribute for the radio button group.
   */
  name?: string;
}

/**
 * PrimeNG radio field type definition.
 */
export type PrimeRadioField<T> = RadioField<T, PrimeRadioProps<T>>;

// ============================================
// MULTI-CHECKBOX FIELD
// ============================================

/**
 * Configuration props for PrimeNG multi-checkbox field component.
 */
export interface PrimeMultiCheckboxProps<T> extends Record<string, unknown> {
  /**
   * Array of options to display as checkboxes.
   */
  options: FieldOption<T>[];
  /**
   * CSS class to apply to the checkbox group.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the checkbox group.
   */
  hint?: DynamicText;
}

/**
 * PrimeNG multi-checkbox field type definition.
 */
export type PrimeMultiCheckboxField<T> = MultiCheckboxField<T, PrimeMultiCheckboxProps<T>>;

// ============================================
// DATEPICKER FIELD
// ============================================

/**
 * Configuration props for PrimeNG datepicker field component.
 */
export interface PrimeDatepickerProps extends Record<string, unknown> {
  /**
   * Format string for displaying dates.
   */
  dateFormat?: string;
  /**
   * Display calendar inline instead of overlay.
   */
  inline?: boolean;
  /**
   * Show calendar icon button.
   */
  showIcon?: boolean;
  /**
   * Show button bar with today/clear buttons.
   */
  showButtonBar?: boolean;
  /**
   * Selection mode (single date, multiple dates, or range).
   */
  selectionMode?: 'single' | 'multiple' | 'range';
  /**
   * Enable touch-optimized UI for mobile devices.
   */
  touchUI?: boolean;
  /**
   * Initial view to display (date, month, or year).
   */
  view?: 'date' | 'month' | 'year';
  /**
   * Hint text displayed below the datepicker.
   */
  hint?: DynamicText;
}

/**
 * PrimeNG datepicker field type definition.
 */
export type PrimeDatepickerField = DatepickerField<PrimeDatepickerProps>;

// ============================================
// SLIDER FIELD
// ============================================

/**
 * Configuration props for PrimeNG slider field component.
 */
export interface PrimeSliderProps extends Record<string, unknown> {
  /**
   * Minimum value of the slider.
   */
  min?: number;
  /**
   * Maximum value of the slider.
   */
  max?: number;
  /**
   * Step increment for slider values.
   */
  step?: number;
  /**
   * Enable range mode with two handles.
   */
  range?: boolean;
  /**
   * Orientation of the slider.
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * CSS class to apply to the slider element.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the slider.
   */
  hint?: DynamicText;
}

/**
 * PrimeNG slider field type definition.
 */
export type PrimeSliderField = SliderField<PrimeSliderProps>;

// ============================================
// TOGGLE FIELD
// ============================================

/**
 * Configuration props for PrimeNG toggle field component.
 */
export interface PrimeToggleProps extends Record<string, unknown> {
  /**
   * CSS class to apply to the toggle element.
   */
  styleClass?: string;
  /**
   * Value to use when toggled on.
   */
  trueValue?: unknown;
  /**
   * Value to use when toggled off.
   */
  falseValue?: unknown;
  /**
   * Hint text displayed below the toggle.
   */
  hint?: DynamicText;
}

/**
 * PrimeNG toggle field type definition.
 */
export type PrimeToggleField = CheckboxField<PrimeToggleProps>;

// ============================================
