import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { TextareaField, TextareaProps } from '@ng-forge/dynamic-forms/integration';

export interface IonicTextareaProps extends TextareaProps {
  autoGrow?: boolean;
  counter?: boolean;
  fill?: 'solid' | 'outline';
  shape?: 'round';
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';
  hint?: DynamicText;
  errorText?: DynamicText;
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
}

export type IonicTextareaField = TextareaField<IonicTextareaProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type IonicTextareaComponent = ValueFieldComponent<IonicTextareaField>;
