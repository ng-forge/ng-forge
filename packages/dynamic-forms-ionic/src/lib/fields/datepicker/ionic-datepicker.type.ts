import { DynamicText } from '@ng-forge/dynamic-forms';
import { DatepickerField, DatepickerProps } from '@ng-forge/dynamic-forms/integration';

export interface IonicDatepickerProps extends DatepickerProps {
  presentation?: 'date' | 'date-time' | 'time' | 'time-date' | 'month' | 'month-year' | 'year';
  multiple?: boolean;
  preferWheel?: boolean;
  showDefaultButtons?: boolean;
  showDefaultTitle?: boolean;
  showDefaultTimeLabel?: boolean;
  showClearButton?: boolean;
  doneText?: DynamicText;
  cancelText?: DynamicText;
  size?: 'cover' | 'fixed';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  hint?: DynamicText;
  /** BCP 47 locale for the picker and the displayed value. Defaults to the browser locale. */
  locale?: string;
}
export type IonicDatepickerField = DatepickerField<IonicDatepickerProps>;
