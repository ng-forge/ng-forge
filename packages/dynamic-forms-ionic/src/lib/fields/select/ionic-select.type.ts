import { DynamicText, SelectField, SelectProps, ValueFieldComponent } from '@ng-forge/dynamic-forms';

export interface IonicSelectProps<T> extends SelectProps {
  multiple?: boolean;
  interface?: 'action-sheet' | 'popover' | 'alert';
  interfaceOptions?: unknown;
  cancelText?: string;
  okText?: string;
  placeholder?: DynamicText;
  fill?: 'solid' | 'outline';
  shape?: 'round';
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  compareWith?: (o1: T, o2: T) => boolean;
}

export type IonicSelectField<T> = SelectField<T, IonicSelectProps<T>>;

export type IonicSelectComponent<T> = ValueFieldComponent<IonicSelectField<T>>;
