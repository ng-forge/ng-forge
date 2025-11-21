import { DynamicText, TextareaField, TextareaProps, ValueFieldComponent } from '@ng-forge/dynamic-forms';

export interface BsTextareaProps extends TextareaProps {
  rows?: number;
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  helpText?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
}

export type BsTextareaField = TextareaField<BsTextareaProps>;

export type BsTextareaComponent = ValueFieldComponent<BsTextareaField>;
