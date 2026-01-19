import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { SelectField, SelectProps } from '@ng-forge/dynamic-forms/integration';

/**
 * Bootstrap select uses native HTML <select> which only supports string values.
 * The compareWith function signature uses string to match this constraint.
 */
export interface BsSelectProps extends SelectProps {
  multiple?: boolean;
  size?: 'sm' | 'lg';
  htmlSize?: number;
  floatingLabel?: boolean;
  hint?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
  compareWith?: (o1: string, o2: string) => boolean;
}

export type BsSelectField<T> = SelectField<T, BsSelectProps>;

/** Bootstrap select only supports string values due to native HTML select limitations */
export type BsSelectComponent = ValueFieldComponent<BsSelectField<string>>;
