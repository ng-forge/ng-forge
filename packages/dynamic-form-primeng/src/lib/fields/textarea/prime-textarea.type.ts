import { DynamicText, TextareaField, TextareaProps, ValueFieldComponent } from '@ng-forge/dynamic-form';

/**
 * Configuration props for PrimeNG textarea field component.
 */
export interface PrimeTextareaProps extends TextareaProps {
  /**
   * Number of visible text lines.
   */
  rows?: number;
  /**
   * Enable automatic resizing based on content.
   */
  autoResize?: boolean;
  /**
   * Maximum number of characters allowed.
   */
  maxlength?: number;
  /**
   * CSS class to apply to the textarea element.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the textarea.
   */
  hint?: DynamicText;
}

/**
 * PrimeNG textarea field type definition.
 */
export type PrimeTextareaField = TextareaField<PrimeTextareaProps>;

export type PrimeTextareaComponent = ValueFieldComponent<PrimeTextareaField>;
