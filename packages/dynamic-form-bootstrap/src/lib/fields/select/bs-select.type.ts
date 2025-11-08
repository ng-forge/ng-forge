import { DynamicText, SelectField, SelectProps, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface BsSelectProps<T> extends SelectProps {
  multiple?: boolean;
  size?: 'sm' | 'lg';
  htmlSize?: number;
  floatingLabel?: boolean;
  helpText?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
  compareWith?: (o1: T, o2: T) => boolean;
}

export type BsSelectField<T> = SelectField<T, BsSelectProps<T>>;

export type BsSelectComponent<T> = ValueFieldComponent<BsSelectField<T>>;
