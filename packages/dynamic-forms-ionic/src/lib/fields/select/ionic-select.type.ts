import { DynamicText, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-forms';
import { SelectField, SelectProps } from '@ng-forge/dynamic-forms/integration';

export interface IonicSelectProps extends SelectProps {
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
  compareWith?: (o1: ValueType, o2: ValueType) => boolean;
  hint?: DynamicText;
}

export type IonicSelectField<T> = SelectField<T, IonicSelectProps>;

export type IonicSelectComponent = ValueFieldComponent<IonicSelectField<ValueType>>;
