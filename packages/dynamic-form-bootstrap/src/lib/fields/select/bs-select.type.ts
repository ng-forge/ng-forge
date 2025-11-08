import { DynamicText, SelectField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface BsSelectProps<T> {
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
