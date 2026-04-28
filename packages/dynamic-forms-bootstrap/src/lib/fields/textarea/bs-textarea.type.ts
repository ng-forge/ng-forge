import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { TextareaField, TextareaProps } from '@ng-forge/dynamic-forms/integration';

export interface BsTextareaProps extends TextareaProps {
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  hint?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
}

export type BsTextareaField = TextareaField<BsTextareaProps>;

export type BsTextareaComponent = ValueFieldComponent<BsTextareaField>;
