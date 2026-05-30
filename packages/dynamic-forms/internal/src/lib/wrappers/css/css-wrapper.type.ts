import { DynamicText } from '../../models/types/dynamic-text';

/** Configuration for the built-in 'css' wrapper type. */
export interface CssWrapper {
  readonly type: 'css';
  /** CSS classes to apply to the wrapper */
  readonly cssClasses?: DynamicText;
}
