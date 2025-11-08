import { ValueFieldComponent, DatepickerField } from '@ng-forge/dynamic-form';

export interface IonicDatepickerProps {
  presentation?: 'date' | 'date-time' | 'time' | 'time-date' | 'month' | 'month-year' | 'year';
  multiple?: boolean;
  preferWheel?: boolean;
  showDefaultButtons?: boolean;
  showDefaultTitle?: boolean;
  showDefaultTimeLabel?: boolean;
  showClearButton?: boolean;
  doneText?: string;
  cancelText?: string;
  size?: 'cover' | 'fixed';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
}
export type IonicDatepickerField = DatepickerField<IonicDatepickerProps>;
export type IonicDatepickerComponent = ValueFieldComponent<IonicDatepickerField>;
