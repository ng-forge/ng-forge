import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { TextareaField, TextareaProps } from '@ng-forge/dynamic-forms/integration';

/** Configuration props for PrimeNG textarea field component. */
export interface PrimeTextareaProps extends TextareaProps {
  /** Enable automatic resizing based on content. */
  autoResize?: boolean;
  /** CSS class to apply to the textarea element. */
  styleClass?: string;
  /** Hint text displayed below the textarea. */
  hint?: DynamicText;
}

/** PrimeNG textarea field type definition. */
export type PrimeTextareaField = TextareaField<PrimeTextareaProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type PrimeTextareaComponent = ValueFieldComponent<PrimeTextareaField>;
