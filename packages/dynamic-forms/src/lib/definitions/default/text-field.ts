import { FieldDef } from '../base/field-def';
import { NonFieldLogicConfig } from '../../core/logic/non-field-logic-resolver';

/**
 * Text element type for rendering different HTML text elements
 */
export type TextElementType = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';

/**
 * Properties for text field configuration
 */
export type TextProps = {
  /** The HTML element type to render */
  elementType: TextElementType;
};

/**
 * Text field definition for displaying translatable text content
 */
export interface TextField extends FieldDef<TextProps> {
  type: 'text';

  /**
   * Logic rules for conditional visibility.
   * Text fields only support 'hidden' logic type since they are display-only
   * and don't participate in form validation (no disabled/readonly/required).
   */
  readonly logic?: NonFieldLogicConfig[];
}
