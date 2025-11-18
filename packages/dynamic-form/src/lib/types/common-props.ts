import { DynamicText } from '../models/types';

/**
 * Base props for all field components
 */
export interface BaseFieldProps {
  /**
   * Additional CSS class names to apply to the field
   */
  styleClass?: string;
}

/**
 * Props for fields that support hint/help text
 */
export interface HintFieldProps {
  /**
   * Help text displayed below the field
   */
  hint?: DynamicText;
}

/**
 * Props for fields that support validation feedback messages
 */
export interface ValidationFeedbackProps {
  /**
   * Message displayed when field is valid (optional)
   */
  validFeedback?: DynamicText;

  /**
   * Message displayed when field is invalid (overrides default validation messages)
   */
  invalidFeedback?: DynamicText;
}

/**
 * Props for text input fields (input, textarea)
 */
export interface TextInputFieldProps extends HintFieldProps {
  /**
   * Size variant for the input
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Maximum length of the input
   */
  maxlength?: number;
}

/**
 * Props for selection fields (radio, checkbox, toggle)
 */
export interface SelectionFieldProps extends HintFieldProps {
  /**
   * Position of the label relative to the control
   */
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';

  /**
   * Color theme for the control
   */
  color?: string;
}

/**
 * Props for button fields
 */
export interface ButtonFieldProps {
  /**
   * Button type attribute
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Color theme for the button
   */
  color?: string;

  /**
   * Size variant for the button
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Props for select/dropdown fields
 */
export interface SelectFieldProps<T> extends HintFieldProps {
  /**
   * Enable multiple selection
   */
  multiple?: boolean;

  /**
   * Comparison function for option values
   */
  compareWith?: (o1: T, o2: T) => boolean;

  /**
   * Placeholder text when no value is selected
   */
  placeholder?: DynamicText;
}

/**
 * Props for date picker fields
 */
export interface DatePickerFieldProps extends HintFieldProps {
  /**
   * Date format string
   */
  dateFormat?: string;

  /**
   * Show icon/button to open picker
   */
  showIcon?: boolean;

  /**
   * Inline display (always visible)
   */
  inline?: boolean;
}

/**
 * Props for slider/range fields
 */
export interface SliderFieldProps extends HintFieldProps {
  /**
   * Minimum value
   */
  min?: number;

  /**
   * Maximum value
   */
  max?: number;

  /**
   * Step increment
   */
  step?: number;

  /**
   * Orientation of the slider
   */
  orientation?: 'horizontal' | 'vertical';
}
