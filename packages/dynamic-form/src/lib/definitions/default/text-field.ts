import { FieldDef } from '../base/field-def';
import { LogicConfig } from '../../models/logic';

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

  /** Logic rules for conditional visibility (hidden, readonly, disabled) */
  readonly logic?: LogicConfig[];
}
