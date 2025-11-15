import { FieldDef } from '../base/field-def';
import { LogicConfig } from '../../models/logic';

/**
 * Text element type for rendering different HTML text elements
 */
export type TextElementType = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';

/**
 * CSS styling properties for text field customization
 */
export type TextFieldStyle = {
  /** Font size (e.g., '16px', '1.2rem', '14pt') */
  fontSize?: string;
  /** Font family (e.g., 'Arial', 'serif', 'monospace') */
  fontFamily?: string;
  /** Font weight (e.g., 'normal', 'bold', '600', 'lighter') */
  fontWeight?: string;
  /** Text color (e.g., '#333', 'rgb(255, 0, 0)', 'var(--primary-color)') */
  color?: string;
  /** Line height (e.g., '1.4', '1.5em', '20px') */
  lineHeight?: string;
  /** Text alignment (e.g., 'left', 'center', 'right', 'justify') */
  textAlign?: string;
  /** Letter spacing (e.g., '0.05em', '1px') */
  letterSpacing?: string;
  /** Text decoration (e.g., 'none', 'underline', 'line-through') */
  textDecoration?: string;
  /** Text transform (e.g., 'none', 'uppercase', 'lowercase', 'capitalize') */
  textTransform?: string;
};

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
