import { DynamicText } from '../../models/types/dynamic-text';

/**
 * Configuration for the built-in 'css' wrapper type.
 *
 * The CSS wrapper applies CSS classes around wrapped content via a DynamicText
 * input that resolves to space-separated class names.
 *
 * @example
 * ```typescript
 * const wrapper: CssWrapper = {
 *   type: 'css',
 *   cssClasses: 'my-css-class another-class',
 * };
 * ```
 */
export interface CssWrapper {
  readonly type: 'css';
  /** CSS classes to apply to the wrapper */
  readonly cssClasses?: DynamicText;
}
