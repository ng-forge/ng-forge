import { DynamicText } from '@ng-forge/dynamic-forms';
import { ValueFieldComponent } from '@ng-forge/dynamic-forms/integration';
import { TextareaField, TextareaProps } from '@ng-forge/dynamic-forms/integration';

export interface BsTextareaProps extends TextareaProps {
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  hint?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
}

export type BsTextareaField = TextareaField<BsTextareaProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type BsTextareaComponent = ValueFieldComponent<BsTextareaField>;
