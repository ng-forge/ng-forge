import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { SelectField, SelectProps } from '@ng-forge/dynamic-forms/integration';

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
