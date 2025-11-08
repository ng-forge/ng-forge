import { DynamicText, TextareaField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface BsTextareaProps {
  rows?: number;
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  helpText?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
}

export type BsTextareaField = TextareaField<BsTextareaProps>;

export type BsTextareaComponent = ValueFieldComponent<BsTextareaField>;
