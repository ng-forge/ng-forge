import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { DatepickerField, DatepickerProps } from '@ng-forge/dynamic-forms/integration';

export interface PrimeDatepickerProps extends DatepickerProps {
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
  /**
   * CSS class to apply to the calendar element.
   */
  styleClass?: string;
}

export type PrimeDatepickerField = DatepickerField<PrimeDatepickerProps>;

export type PrimeDatepickerComponent = ValueFieldComponent<PrimeDatepickerField>;
